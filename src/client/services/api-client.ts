const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export async function fetchJson<T = unknown>(
    endpoint: string,
    options: Omit<RequestInit, "body"> & { body?: any } = {}
): Promise<T> {
    const url = `${API_BASE}${endpoint}`;

    const headers: Record<string, string> = {
        Accept: "application/json",
        ...(options.headers ? (options.headers as Record<string, string>) : {}),
    };

    if (options.body && typeof options.body !== "string") {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(options.body);
    }

    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
        const message = await extractErrorMessage(res);
        throw new Error(`API Error ${res.status}: ${message}`);
    }

    const text = await res.text();
    return text ? (JSON.parse(text) as T) : ({} as T);
}

export function postSse(
    endpoint: string,
    {
        body,
        onMessage,
        onError,
        onEnd,
    }: {
        body?: any;
        onMessage: (data: any) => void;
        onError?: (error: Error) => void;
        onEnd?: () => void;
    }
): { close: () => void } {
    const url = `${API_BASE}${endpoint}`;
    const controller = new AbortController();

    (async () => {
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    Accept: "text/event-stream",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            });

            if (!res.ok || !res.body) {
                throw new Error(`SSE connection failed: ${res.status}`);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                let boundary: number;
                while ((boundary = buffer.indexOf("\n\n")) !== -1) {
                    const rawEvent = buffer.slice(0, boundary).trim();
                    buffer = buffer.slice(boundary + 2);

                    const lines = rawEvent.split("\n");
                    let eventType = "message";
                    let dataStr = "";

                    for (const line of lines) {
                        if (line.startsWith("event:")) {
                            eventType = line.replace(/^event:\s*/, "").trim();
                        } else if (line.startsWith("data:")) {
                            dataStr += line.replace(/^data:\s*/, "").trim();
                        }
                    }

                    switch (eventType) {
                        case "message":
                            if (dataStr) {
                                try {
                                    onMessage(JSON.parse(dataStr));
                                } catch {
                                    onMessage(dataStr);
                                }
                            }
                            break;

                        case "end":
                            onEnd?.();
                            controller.abort();
                            return;

                        case "error":
                            onError?.(new Error(dataStr || "Unknown SSE error"));
                            controller.abort();
                            return;
                    }
                }
            }

            onEnd?.();
        } catch (err) {
            if (!(err instanceof DOMException && err.name === "AbortError")) {
                onError?.(err as Error);
            }
        }
    })();

    return {
        close: () => controller.abort(),
    };
}

async function extractErrorMessage(res: Response): Promise<string> {
    try {
        const data = await res.json();
        return data?.message ?? res.statusText;
    } catch {
        return res.statusText;
    }
}