import React, { useState } from 'react';
import { fetchWorkspaceContent } from '../api';

// --- HELPER COMPONENT: Renders a single Board ---
const BoardItem = ({ board, isActive, onClick }) => (
    <button
        onClick={() => onClick(board.id)}
        className={`w-full text-left py-1.5 px-2.5 text-sm rounded transition-colors flex items-center gap-2 truncate ${
            isActive 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'hover:bg-slate-100 text-slate-600'
        }`}
    >
        <span className="text-slate-400 text-xs">📋</span>
        <span className="truncate">{board.name}</span>
    </button>
);

// --- HELPER COMPONENT: Renders a Folder and its nested contents ---
const FolderTree = ({ folder, allFolders, allBoards, activeBoardId, onSelectBoard }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Find all sub-folders and boards that belong to THIS specific folder
    const subFolders = allFolders.filter(f => f.parent?.id === folder.id);
    const subBoards = allBoards.filter(b => String(b.board_folder_id) === String(folder.id));

    return (
        <div className="flex flex-col gap-1 w-full">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center gap-2 p-1.5 text-left rounded hover:bg-slate-100 transition-colors text-slate-700 text-sm group"
            >
                <span className="text-slate-400 text-[10px] w-3 text-center transition-transform">
                    {isExpanded ? '▼' : '▶'}
                </span>
                <span className="text-blue-400 text-xs">📁</span>
                <span className="truncate font-medium">{folder.name}</span>
            </button>
            
            {/* If expanded, render children recursively! */}
            {isExpanded && (
                <div className="pl-4 border-l border-slate-200 ml-2 flex flex-col gap-1 mt-1">
                    {subFolders.map(subFolder => (
                        <FolderTree 
                            key={subFolder.id}
                            folder={subFolder}
                            allFolders={allFolders}
                            allBoards={allBoards}
                            activeBoardId={activeBoardId}
                            onSelectBoard={onSelectBoard}
                        />
                    ))}
                    {subBoards.map(board => (
                        <BoardItem 
                            key={board.id} 
                            board={board} 
                            isActive={activeBoardId === board.id}
                            onClick={onSelectBoard}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- MAIN SIDEBAR COMPONENT ---
function Sidebar({ workspaces = [], activeBoardId, onSelectBoard, onDisconnect }) {
    const [expandedWorkspaces, setExpandedWorkspaces] = useState({});
    const [workspaceContent, setWorkspaceContent] = useState({});
    const [loadingWorkspaces, setLoadingWorkspaces] = useState({});

    const handleToggleWorkspace = async (workspaceId) => {
        const isExpanding = !expandedWorkspaces[workspaceId];
        setExpandedWorkspaces(prev => ({ ...prev, [workspaceId]: isExpanding }));

        if (isExpanding && !workspaceContent[workspaceId]) {
            setLoadingWorkspaces(prev => ({ ...prev, [workspaceId]: true }));
            try {
                const content = await fetchWorkspaceContent(workspaceId);
                setWorkspaceContent(prev => ({ ...prev, [workspaceId]: content }));
            } catch (error) {
                console.error("Error fetching workspace content:", error);
            } finally {
                setLoadingWorkspaces(prev => ({ ...prev, [workspaceId]: false }));
            }
        }
    };

    return (
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 shadow-sm z-30 font-sans">
            <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🏢</span>
                    <h3 className="text-base font-bold tracking-wide">Workspaces</h3>
                </div>
                <button 
                    onClick={onDisconnect} 
                    className="text-xs py-1 px-2.5 bg-red-500 hover:bg-red-600 rounded text-white transition-colors"
                >
                    Disconnect
                </button>
            </div>
            
            <div className="p-3 overflow-y-auto flex-1">
                {workspaces.map(ws => {
                    const isExpanded = expandedWorkspaces[ws.id];
                    const isLoading = loadingWorkspaces[ws.id];
                    const content = workspaceContent[ws.id];

                    // Identify top-level items (not inside any folders)
                    const topLevelFolders = content ? content.folders.filter(f => !f.parent) : [];
                    const topLevelBoards = content ? content.boards.filter(b => !b.board_folder_id) : [];

                    return (
                        <div key={ws.id} className="mb-3">
                            {/* Workspace Header Toggle */}
                            <button 
                                onClick={() => handleToggleWorkspace(ws.id)}
                                className="w-full flex items-center justify-between p-2 text-left rounded-md hover:bg-slate-100 transition-colors group"
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="text-slate-400 text-xs transition-transform duration-200">
                                        {isExpanded ? '▼' : '▶'}
                                    </span>
                                    <span className="text-sm font-bold text-slate-700 truncate">
                                        {ws.name}
                                    </span>
                                </div>
                            </button>

                            {/* Expanded Workspace Content */}
                            {isExpanded && (
                                <div className="mt-1 ml-4 pl-2 border-l border-slate-200 flex flex-col gap-1">
                                    {isLoading ? (
                                        <div className="text-xs text-slate-400 py-1 pl-2 animate-pulse">Loading contents...</div>
                                    ) : (!content || (topLevelFolders.length === 0 && topLevelBoards.length === 0)) ? (
                                        <div className="text-xs text-slate-400 py-1 pl-2">No boards yet</div>
                                    ) : (
                                        <>
                                            {/* Render Folders First */}
                                            {topLevelFolders.map(folder => (
                                                <FolderTree 
                                                    key={folder.id}
                                                    folder={folder}
                                                    allFolders={content.folders}
                                                    allBoards={content.boards}
                                                    activeBoardId={activeBoardId}
                                                    onSelectBoard={onSelectBoard}
                                                />
                                            ))}
                                            
                                            {/* Render Loose Boards Second */}
                                            {topLevelBoards.map(board => (
                                                <BoardItem 
                                                    key={board.id}
                                                    board={board}
                                                    isActive={activeBoardId === board.id}
                                                    onClick={onSelectBoard}
                                                />
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}

export default Sidebar;