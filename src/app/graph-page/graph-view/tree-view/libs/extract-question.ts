import { TurnNode } from '../models';

const extractText = (content: unknown): string => {
    if (typeof content === 'string') return content;

    if (Array.isArray(content)) {
        return content
            .map((item) => {
                if (typeof item === 'string') return item;
                if (!item || typeof item !== 'object') return '';

                const text = 'text' in item ? item.text : undefined;
                return typeof text === 'string' ? text : '';
            })
            .filter(Boolean)
            .join('\n');
    }

    return '';
};

export const extractQuestion = (turnNode: TurnNode): string => {
    return extractText(turnNode.nodes[0]?.message?.content).trim();
};
