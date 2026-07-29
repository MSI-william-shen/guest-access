const axios = require('axios');

const MONDAY_API_URL = 'https://api.monday.com/v2';

// Helper function to handle the actual API calls to monday.com cleanly
const executeMondayQuery = async (query, variables = {}) => {
    try {
        const response = await axios.post(
            MONDAY_API_URL,
            { query, variables },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': process.env.MONDAY_API_TOKEN,
                    'API-Version': '2024-01'
                }
            }
        );

        if (response.data.errors) {
            throw new Error(response.data.errors[0].message);
        }

        return response.data.data;
    } catch (error) {
        console.error("Monday API Error:", error.message);
        throw error;
    }
};

// 1. Fetch workspaces and boards
exports.getWorkspacesAndBoards = async (req, res) => {
    const query = `
        query {
            workspaces { id name }
            boards(limit: 50) {
                id name
                workspace { id }
            }
        }
    `;
    try {
        const data = await executeMondayQuery(query);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Fetch Board Layout (Columns, Groups, and Items)
exports.getBoardLayout = async (req, res) => {
    const { boardId } = req.params;
    
    const query = `
        query getBoardData($boardId: [ID!]) {
            boards(ids: $boardId) {
                name
                columns { id title type }
                groups {
                    id title
                    items_page(limit: 100) {
                        items {
                            id name
                            column_values { id text }
                        }
                    }
                }
            }
        }
    `;

    try {
        const data = await executeMondayQuery(query, { boardId: [boardId] });
        
        if (!data.boards || data.boards.length === 0) {
            return res.status(404).json({ error: 'Board not found' });
        }
        
        res.status(200).json(data.boards[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Fetch specific Board metadata by ID
exports.getBoardById = async (req, res) => {
    const { boardId } = req.params;
    const query = `
        query getBoardData($boardId: [ID!]) {
            boards(ids: $boardId) {
                id name description state
                workspace { id name }
            }
        }
    `;
    try {
        const data = await executeMondayQuery(query, { boardId: [boardId] });
        res.status(200).json(data.boards[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Fetch a specific Workspace by ID
exports.getWorkspaceById = async (req, res) => {
    const { workspaceId } = req.params;
    const query = `
        query getWorkspaceData($workspaceId: [ID!]) {
            workspaces(ids: $workspaceId) {
                id name description state
            }
        }
    `;
    try {
        const data = await executeMondayQuery(query, { workspaceId: [workspaceId] });
        res.status(200).json(data.workspaces[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};