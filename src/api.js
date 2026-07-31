import mondaySdk from "monday-sdk-js";

const monday = mondaySdk();

export const setMondayToken = (token) => {
    monday.setToken(token);
};

// 1. Fetch only the workspaces
export const fetchWorkspaces = async () => {
    const query = `
        query {
            workspaces(limit: 200) {
                id
                name
            }
        }
    `;
    const response = await monday.api(query);
    if (response.errors) throw new Error(response.errors[0].message);
    
    return response.data.workspaces;
};

// 2. Fetch BOTH Folders and Boards
export const fetchWorkspaceContent = async (workspaceId) => {
    const ids = workspaceId === 'main' ? [null] : [workspaceId];

    const query = `
        query getWorkspaceContent($workspaceIds: [ID]) {
            folders(workspace_ids: $workspaceIds, limit: 100) {
                id
                name
                parent { id }
            }
            boards(workspace_ids: $workspaceIds, limit: 100) {
                id
                name
                board_folder_id
                type
            }
        }
    `;
    
    const response = await monday.api(query, { variables: { workspaceIds: ids } });
    if (response.errors) throw new Error(response.errors[0].message);
    
    // 🛑 NEW: Filter out Monday's hidden "sub_items_board" type so they don't clutter your sidebar
    const cleanBoards = (response.data.boards || []).filter(b => b.type !== 'sub_items_board');

    return {
        folders: response.data.folders || [],
        boards: cleanBoards
    };
};

// 3. Fetch specific board layout (Now with Subitems!)
export const fetchBoardLayout = async (boardId) => {
    const query = `
        query getBoardData($boardId: [ID!]) {
            boards(ids: $boardId) {
                name
                columns { id title type }
                groups {
                    id title color
                    items_page(limit: 100) {
                        items {
                            id name
                            column_values { id text }
                            
                            # 🛑 NEW: Fetch subitems nested under the parent item
                            subitems {
                                id name
                                column_values { id text }
                            }
                        }
                    }
                }
            }
        }
    `;
    
    const response = await monday.api(query, { variables: { boardId: [boardId] } });
    if (response.errors) throw new Error(response.errors[0].message);
    
    return response.data.boards[0];
};

// 🛑 NEW: Fetch Updates and Replies for a specific Item
export const fetchItemUpdates = async (itemId) => {
    const query = `
        query getItemUpdates($itemId: [ID!]) {
            items(ids: $itemId) {
                name
                updates {
                    id
                    body
                    created_at
                    creator {
                        name
                        photo_thumb
                    }
                    replies {
                        id
                        body
                        created_at
                        creator {
                            name
                            photo_thumb
                        }
                    }
                }
            }
        }
    `;
    
    const response = await monday.api(query, { variables: { itemId: [itemId] } });
    if (response.errors) throw new Error(response.errors[0].message);
    
    return response.data.items[0];
};