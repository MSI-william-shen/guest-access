import React, { useState, useEffect } from 'react';
import { fetchBoardLayout } from '../api';
import UpdatesModal from './UpdatesModal';

function BoardView({ boardId }) {
    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Track expanded subitems
    const [expandedItems, setExpandedItems] = useState({});
    
    // Track column widths (Defaults: Item Name = 320px, Others = 140px)
    const [colWidths, setColWidths] = useState({ item_name: 320 });

    // Track which item's comments are currently open
    const [activeUpdateItemId, setActiveUpdateItemId] = useState(null);

    useEffect(() => {
        setLoading(true);
        setExpandedItems({}); 
        
        fetchBoardLayout(boardId)
            .then(data => {
                setBoard(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching board layout:", err);
                setLoading(false);
            });
    }, [boardId]);

    const toggleItem = (itemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    // Handle Column Resizing
    const handleResizeStart = (e, colId) => {
        e.preventDefault();
        const startX = e.pageX;
        const startWidth = colWidths[colId] || (colId === 'item_name' ? 320 : 140);

        const handleMouseMove = (moveEvent) => {
            // Calculate new width (minimum width of 60px so it doesn't disappear)
            const newWidth = Math.max(60, startWidth + (moveEvent.pageX - startX));
            setColWidths(prev => ({ ...prev, [colId]: newWidth }));
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    if (loading) return <div className="p-8 text-slate-500 font-sans text-lg animate-pulse">Loading board data...</div>;
    if (!board) return <div className="p-8 text-red-500 font-sans text-lg">Failed to load board.</div>;

    // 🛑 NEW: Filter out the redundant 'name' and 'subitems' columns
    const visibleColumns = board.columns.filter(col => {
        const titleLower = col.title.toLowerCase();
        const idLower = col.id.toLowerCase();
        return (
            idLower !== 'name' && 
            titleLower !== 'name' && 
            idLower !== 'subitems' && 
            titleLower !== 'subitems' &&
            col.type !== 'subtasks'
        );
    });

    return (
        <div className="flex flex-col h-full bg-white font-sans relative">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">{board.name}</h1>

            <div className="flex-1 overflow-auto pb-20">
                {board.groups.map(group => (
                    <div key={group.id} className="mb-12">
                        
                        {/* Group Header */}
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-sm cursor-pointer" style={{ color: group.color }}>▼</span>
                            <h3 className="text-xl font-medium" style={{ color: group.color }}>
                                {group.title}
                            </h3>
                            <span className="text-slate-400 text-sm ml-2">
                                {group.items_page.items.length} Items
                            </span>
                        </div>

                        {/* Table Wrapper */}
                        <div className="overflow-x-auto border border-slate-300 rounded-md shadow-sm">
                            <table className="text-left border-collapse whitespace-nowrap bg-white table-fixed">
                                <thead>
                                    <tr>
                                        {/* Sticky Name Column Header */}
                                        <th 
                                            className="relative sticky left-0 z-20 bg-slate-50 border-b border-r border-slate-300 px-4 py-2 text-sm font-normal text-slate-600 shadow-[1px_0_0_0_#cbd5e1]"
                                            style={{ 
                                                width: colWidths['item_name'], 
                                                minWidth: colWidths['item_name'], 
                                                maxWidth: colWidths['item_name'] 
                                            }}
                                        >
                                            <div className="truncate">Item</div>
                                            {/* Resize Handle */}
                                            <div 
                                                onMouseDown={(e) => handleResizeStart(e, 'item_name')}
                                                className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-400 transition-colors z-30"
                                                title="Drag to resize"
                                            />
                                        </th>
                                        
                                        {/* 🛑 USING visibleColumns instead of board.columns */}
                                        {visibleColumns.map(col => {
                                            const w = colWidths[col.id] || 140;
                                            return (
                                                <th 
                                                    key={col.id} 
                                                    className="relative bg-slate-50 border-b border-r border-slate-300 px-4 py-2 text-sm font-normal text-slate-600"
                                                    style={{ width: w, minWidth: w, maxWidth: w }}
                                                >
                                                    <div className="truncate">{col.title}</div>
                                                    {/* Resize Handle */}
                                                    <div 
                                                        onMouseDown={(e) => handleResizeStart(e, col.id)}
                                                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-400 transition-colors z-30"
                                                        title="Drag to resize"
                                                    />
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                
                                <tbody>
                                    {group.items_page.items.map(item => {
                                        const hasSubitems = item.subitems && item.subitems.length > 0;
                                        const isExpanded = expandedItems[item.id];
                                        const nameWidth = colWidths['item_name'];

                                        return (
                                            <React.Fragment key={item.id}>
                                                
                                                {/* Parent Row */}
                                                <tr className="group/row hover:bg-slate-50 transition-colors">
                                                    <td 
                                                        className="sticky left-0 z-10 bg-white border-b border-r border-slate-300 px-4 py-2 text-sm text-slate-800 shadow-[1px_0_0_0_#cbd5e1] group-hover/row:bg-slate-50 transition-colors"
                                                        style={{ 
                                                            borderLeft: `6px solid ${group.color}`,
                                                            width: nameWidth, 
                                                            minWidth: nameWidth, 
                                                            maxWidth: nameWidth
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2 overflow-hidden w-full pr-2">
                                                            {hasSubitems ? (
                                                                <button 
                                                                    onClick={() => toggleItem(item.id)} 
                                                                    className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded transition-colors"
                                                                >
                                                                    {isExpanded ? '▼' : '▶'}
                                                                </button>
                                                            ) : (
                                                                <span className="w-5 flex-shrink-0"></span> 
                                                            )}
                                                            
                                                            <span className="truncate font-medium">{item.name}</span>
                                                            
                                                            {/* Comments Button */}
                                                            <button 
                                                                onClick={() => setActiveUpdateItemId(item.id)}
                                                                className="ml-auto flex-shrink-0 text-slate-300 hover:text-blue-500 transition-colors"
                                                                title="View Updates"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                    
                                                    {/* 🛑 USING visibleColumns */}
                                                    {visibleColumns.map(col => {
                                                        const cellData = item.column_values.find(c => c.id === col.id);
                                                        const w = colWidths[col.id] || 140;
                                                        return (
                                                            <td 
                                                                key={col.id} 
                                                                className="border-b border-r border-slate-200 px-4 py-2 text-sm text-slate-700 truncate"
                                                                style={{ width: w, minWidth: w, maxWidth: w }}
                                                            >
                                                                {cellData ? cellData.text : ''}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>

                                                {/* Subitem Rows */}
                                                {isExpanded && hasSubitems && item.subitems.map(subitem => (
                                                    <tr key={subitem.id} className="bg-slate-50 hover:bg-slate-100 transition-colors">
                                                        <td 
                                                            className="sticky left-0 z-10 bg-slate-50 border-b border-r border-slate-300 px-4 py-2 text-sm text-slate-700 shadow-[1px_0_0_0_#cbd5e1] hover:bg-slate-100 transition-colors"
                                                            style={{ 
                                                                borderLeft: `6px solid ${group.color}`,
                                                                width: nameWidth, 
                                                                minWidth: nameWidth, 
                                                                maxWidth: nameWidth
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-2 pl-8 overflow-hidden w-full pr-2">
                                                                <span className="text-slate-300 text-lg leading-none flex-shrink-0">↳</span>
                                                                <span className="truncate">{subitem.name}</span>
                                                                
                                                                {/* Comments Button for Subitems */}
                                                                <button 
                                                                    onClick={() => setActiveUpdateItemId(subitem.id)}
                                                                    className="ml-auto flex-shrink-0 text-slate-300 hover:text-blue-500 transition-colors"
                                                                    title="View Updates"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                        
                                                        {/* 🛑 USING visibleColumns */}
                                                        {visibleColumns.map(col => {
                                                            const cellData = subitem.column_values.find(c => c.id === col.id);
                                                            const w = colWidths[col.id] || 140;
                                                            return (
                                                                <td 
                                                                    key={`sub-${col.id}`} 
                                                                    className="border-b border-r border-slate-200 px-4 py-2 text-sm text-slate-500 truncate"
                                                                    style={{ width: w, minWidth: w, maxWidth: w }}
                                                                >
                                                                    {cellData ? cellData.text : ''}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}

                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            {/* Render the Comments Modal if an item is selected */}
            <UpdatesModal 
                itemId={activeUpdateItemId} 
                onClose={() => setActiveUpdateItemId(null)} 
            />
        </div>
    );
}

export default BoardView;