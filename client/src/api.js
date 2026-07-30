const API_BASE_URL = 'http://localhost:8080/api';

// Fetch workspaces and boards
export const fetchWorkspaces = async () => {
    const response = await fetch(`${API_BASE_URL}/monday/workspaces`);
    if (!response.ok) throw new Error('Failed to fetch workspaces');
    return response.json();
};

// Fetch specific board layout
export const fetchBoardLayout = async (boardId) => {
    const response = await fetch(`${API_BASE_URL}/monday/board/${boardId}/layout`);
    if (!response.ok) throw new Error('Failed to fetch board layout');
    return response.json();
};

// Fetch comments for an item
export const fetchItemUpdates = async (itemId) => {
    const response = await fetch(`${API_BASE_URL}/monday/item/${itemId}/updates`);
    if (!response.ok) throw new Error('Failed to fetch updates');
    return response.json();
};

// Post a new comment to an item
export const postItemUpdate = async (itemId, updateText) => {
    const response = await fetch(`${API_BASE_URL}/monday/item/${itemId}/updates`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updateText }),
    });
    if (!response.ok) throw new Error('Failed to post update');
    return response.json();
};