const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardControllers.js');

// 1. Fetch workspaces
router.get('/workspaces', boardController.getWorkspacesAndBoards);

// 2. Fetch the specific board layout 
router.get('/board/:boardId/layout', boardController.getBoardLayout);

// 3. Fetch specific board metadata 
router.get('/board/:boardId', boardController.getBoardById);

// 4. Fetch specific workspace metadata 
router.get('/workspace/:workspaceId', boardController.getWorkspaceById);

// 5. Fetch updates for a specific item
router.get('/item/:itemId/updates', boardController.getItemUpdates);

// 6. Create a new text update for a specific item
router.post('/item/:itemId/updates', boardController.createItemUpdate);

module.exports = router;