function key(userId: string) {
    return `dormdeal:${userId}:hidden-conversations`;
}

export function readHiddenConversations(userId: string): string[] {
    try {
        const value = JSON.parse(localStorage.getItem(key(userId)) ?? '[]');
        return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
    } catch {
        return [];
    }
}

export function hideConversations(userId: string, ids: string[]) {
    const next = [...new Set([...readHiddenConversations(userId), ...ids])];
    localStorage.setItem(key(userId), JSON.stringify(next));
    return next;
}
