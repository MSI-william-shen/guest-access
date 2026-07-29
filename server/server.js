// Load environment variables from your .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import your custom routes
const mondayRoutes = require('./routes/mondayRoutes.js');

const app = express();

// --- MIDDLEWARE ---

// 1. Configure CORS to allow your Vite frontend to securely talk to this backend
const corsOptions = {
    origin: 'http://localhost:5173', // Your React app's local URL
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 2. Allow Express to read incoming JSON data (useful when we build the comments system)
app.use(express.json());


// --- ROUTES ---

// Health check endpoint (Visit http://localhost:8080/api/status to verify it's working)
app.get('/api/status', (req, res) => {
    res.json({ status: 'Backend is running successfully.' });
});

// Send all monday.com API requests to your dedicated router file
app.use('/api/monday', mondayRoutes);


// --- START SERVER ---

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`✅ Server is successfully listening on port ${PORT}`);
});