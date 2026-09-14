export function toolResult(data: unknown) {
    return {
        content: [
            {
                type: 'text' as const,
                text: JSON.stringify(data, null, 2),
            },
        ],
    };
}

export function compactBody(params: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined),
    );
}

export function toolError(error: unknown) {
    const message =
        error instanceof Error ? error.message : String(error);
    return {
        content: [
            {
                type: 'text' as const,
                text: `Error: ${message}`,
            },
        ],
        isError: true,
    };
}
