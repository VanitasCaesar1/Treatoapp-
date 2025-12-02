// Utility functions for parsing hashtags and mentions in post content

export function parseHashtagsAndMentions(text: string) {
    const hashtags: string[] = [];
    const mentions: string[] = [];

    // Extract hashtags (#word)
    const hashtagRegex = /#(\w+)/g;
    let hashtagMatch;
    while ((hashtagMatch = hashtagRegex.exec(text)) !== null) {
        hashtags.push(hashtagMatch[1]);
    }

    // Extract mentions (@username)
    const mentionRegex = /@(\w+)/g;
    let mentionMatch;
    while ((mentionMatch = mentionRegex.exec(text)) !== null) {
        mentions.push(mentionMatch[1]);
    }

    return { hashtags, mentions };
}

export function renderContentWithLinks(text: string) {
    if (!text) return text;

    // Replace hashtags with clickable links
    let processed = text.replace(
        /#(\w+)/g,
        '<a href="/explore?hashtag=$1" class="text-medical-blue font-semibold hover:underline">#$1</a>'
    );

    // Replace mentions with clickable links
    processed = processed.replace(
        /@(\w+)/g,
        '<a href="/search?q=$1" class="text-medical-blue font-semibold hover:underline">@$1</a>'
    );

    return processed;
}

export function highlightHashtagsAndMentions(text: string) {
    if (!text) return [];

    const parts: Array<{ type: 'text' | 'hashtag' | 'mention'; content: string }> = [];
    const regex = /(#\w+|@\w+)/g;

    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: text.slice(lastIndex, match.index)
            });
        }

        // Add hashtag or mention
        const matched = match[0];
        parts.push({
            type: matched.startsWith('#') ? 'hashtag' : 'mention',
            content: matched
        });

        lastIndex = match.index + matched.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push({
            type: 'text',
            content: text.slice(lastIndex)
        });
    }

    return parts;
}
