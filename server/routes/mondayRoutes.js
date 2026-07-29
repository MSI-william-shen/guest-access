const express = require('express');
const router = express.Router();

// Import the controller that holds your actual monday.com GraphQL queries
// Note: Based on your file structure, your file is named "boardControllers.js"
const boardController = require('../controllers/boardControllers.js');

// ---------------------------------------------------------
// AUTHENTICATION (Bypassed for now)
// ---------------------------------------------------------
// If we were using the login system, we would activate this:
// const { verifyClientToken } = require('../middleware/auth');
// router.use(verifyClientToken); 


// ---------------------------------------------------------
// ENDPOINTS
// ---------------------------------------------------------

// 1. Fetch workspaces (Used by your frontend api.js)
router.get('/workspaces', boardController.getWorkspacesAndBoards);

// 2. Fetch the specific board layout (THIS IS THE ONE YOUR FRONTEND IS CURRENTLY CALLING)
router.get('/board/:boardId/layout', boardController.getBoardLayout);

// 3. Fetch specific board metadata (Optional, we built this earlier)
router.get('/board/:boardId', boardController.getBoardById);

// 4. Fetch specific workspace metadata (Optional, we built this earlier)
router.get('/workspace/:workspaceId', boardController.getWorkspaceById);

module.exports = router;