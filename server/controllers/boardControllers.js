const axios = require('axios');

// Securely pull your token from the .env file
const MONDAY_TOKEN = process.env.MONDAY_API_TOKEN;
const MONDAY_API_URL = 'https://api.monday.com/v2';

const executeMondayQuery = async (query, variables = {}) => {
    try {
        const response = await axios.post(
            MONDAY_API_URL,
            { query, variables },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': MONDAY_TOKEN,
                    'API-Version': '2024-01'
                }
            }
        );

        // Catch Error
        if (response.data.errors) {
            console.error('GraphQL Error:', response.data.errors);
            throw new Error(response.data.errors[0].message);
        }

        return response.data.data;
    } catch (error) {
        throw new Error('Failed to communicate with monday.com');
    }
};

// Fetch Workspaces & Boards
exports.getWorkspacesAndBoards = async (req, res) => {
    const query = `
        query {
            workspaces {
                id
                name
            }
            boards(limit: 50) {
                id
                name
                workspace {
                    id
                }
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

// Fetch Board Layout and Items
exports.getBoardLayout = async (req, res) => {
    const { boardId } = req.params;
    
    const query = `
        query getBoardData($boardId: [ID!]) {
            boards(ids: $boardId) {
                name
                columns {
                    id
                    title
                    type
                }
                groups {
                    id
                    title
                    items_page(limit: 100) {
                        items {
                            id
                            name
                            column_values {
                                id
                                text
                            }
                        }
                    }
                }
            }
        }
    `;

    try {
        // Pass the boardId from the URL parameters as a variable
        const data = await executeMondayQuery(query, { boardId: [boardId] });
        res.status(200).json(data.boards[0]); // Return just the targeted board
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};