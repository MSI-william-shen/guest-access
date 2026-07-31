import React, { useState, useEffect } from 'react';
import { setMondayToken, fetchWorkspaces } from './api';
import Sidebar from './components/Sidebar';
import BoardView from './components/BoardView';

function App() {
  const [apiToken, setApiToken] = useState(localStorage.getItem('monday_api_token') || "");
  const [isConnected, setIsConnected] = useState(false);
  
  const [workspaces, setWorkspaces] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem('monday_api_token')) {
        handleConnect(localStorage.getItem('monday_api_token'));
    }
  }, []);

  const handleConnect = async (tokenToUse) => {
    try {
        setError("");
        setMondayToken(tokenToUse);
        
        // Only fetch workspaces on initial load
        const fetchedWorkspaces = await fetchWorkspaces();
        
        // Inject the Main Workspace at the very top of the list
        setWorkspaces([
            { id: 'main', name: 'Main Workspace' },
            ...fetchedWorkspaces
        ]);
        
        setIsConnected(true);
        localStorage.setItem('monday_api_token', tokenToUse);
    } catch (err) {
        setError("Failed to connect. Please check your API token.");
        setIsConnected(false);
        localStorage.removeItem('monday_api_token');
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('monday_api_token');
    setApiToken("");
    setIsConnected(false);
    setWorkspaces([]);
    setActiveBoardId(null);
  };

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 font-sans">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Connect to Monday.com</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="flex flex-col gap-4">
          <label className="flex flex-col font-semibold text-slate-700">
            Personal API Token:
            <input 
              type="password" 
              value={apiToken} 
              onChange={(e) => setApiToken(e.target.value)}
              className="mt-1 p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-normal"
            />
          </label>
          <button 
            onClick={() => handleConnect(apiToken)}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
          >
            Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full m-0 font-sans text-slate-800 bg-slate-50">
      <Sidebar 
        workspaces={workspaces}
        activeBoardId={activeBoardId}
        onSelectBoard={setActiveBoardId}
        onDisconnect={handleDisconnect}
      />

      <main className="flex-1 p-8 bg-white overflow-y-auto">
          {!activeBoardId ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <span className="text-5xl mb-4">📋</span>
                  <h2 className="text-xl font-medium text-slate-600">Select a board</h2>
                  <p className="text-sm">Expand a workspace in the sidebar to choose a board.</p>
              </div>
          ) : (
              <BoardView boardId={activeBoardId} />
          )}
      </main>
    </div>
  );
}

export default App;