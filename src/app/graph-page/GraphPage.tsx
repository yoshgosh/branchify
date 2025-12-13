"use client";

import GraphArea from "./graph-area/GraphArea";
import Sidebar from "./sidebar/Sidebar";

export default function GraphChatPage() {
    return (
        <div className="h-screen flex divide-x divide-border overflow-hidden">
            <Sidebar />
            <GraphArea />
        </div>
    );
}
