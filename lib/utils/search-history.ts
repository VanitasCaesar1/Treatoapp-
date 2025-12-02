import { Preferences } from '@capacitor/preferences';

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
    query: string;
    timestamp: number;
    type: 'doctor' | 'hospital' | 'general';
}

export async function getSearchHistory(): Promise<SearchHistoryItem[]> {
    try {
        const { value } = await Preferences.get({ key: SEARCH_HISTORY_KEY });
        if (value) {
            return JSON.parse(value);
        }
    } catch (error) {
        console.error('Failed to get search history:', error);
    }
    return [];
}

export async function addToSearchHistory(query: string, type: 'doctor' | 'hospital' | 'general' = 'general'): Promise<void> {
    if (!query || query.length < 2) return;

    try {
        const history = await getSearchHistory();

        // Remove duplicate if exists
        const filtered = history.filter(item => item.query.toLowerCase() !== query.toLowerCase());

        // Add new item at the beginning
        const newHistory = [
            { query, timestamp: Date.now(), type },
            ...filtered
        ].slice(0, MAX_HISTORY_ITEMS);

        await Preferences.set({
            key: SEARCH_HISTORY_KEY,
            value: JSON.stringify(newHistory),
        });
    } catch (error) {
        console.error('Failed to add to search history:', error);
    }
}

export async function removeFromSearchHistory(query: string): Promise<void> {
    try {
        const history = await getSearchHistory();
        const filtered = history.filter(item => item.query !== query);

        await Preferences.set({
            key: SEARCH_HISTORY_KEY,
            value: JSON.stringify(filtered),
        });
    } catch (error) {
        console.error('Failed to remove from search history:', error);
    }
}

export async function clearSearchHistory(): Promise<void> {
    try {
        await Preferences.remove({ key: SEARCH_HISTORY_KEY });
    } catch (error) {
        console.error('Failed to clear search history:', error);
    }
}
