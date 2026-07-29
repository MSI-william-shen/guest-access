// In your backend server.js
const corsOptions = {
    // Replace this with the actual URL where your React app will be hosted
    origin: ['http://localhost:5173', 'https://my-custom-portal.vercel.app'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));