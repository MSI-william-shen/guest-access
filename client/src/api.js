
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/monday';

export const fetchWorkspaces = async () => {
    const res = await fetch(`${BACKEND_URL}/workspaces`);
    return res.json();
};

export const fetchBoardLayout = async (boardId) => {
    const res = await fetch(`${BACKEND_URL}/board/${boardId}/layout`);
    return res.json();
};