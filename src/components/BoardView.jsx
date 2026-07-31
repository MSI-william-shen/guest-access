import React, { useState, useEffect } from 'react';
import { fetchBoardLayout } from '../api';

function BoardView({ boardId }) {
    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [expandedItems, setExpandedItems] = useState({});
    
    // 🛑 NEW: Track column widths (Defaults: Item Name = 320px, Others = 140px)
    const [colWidths, setColWidths] = useState({ item_name: 320 });

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

    // 🛑 NEW: Handle Column Resizing
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

    return (
        <div className="flex flex-col h-full bg-white font-sans">
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
                            {/* We enforce table-fixed so our manual widths are strictly obeyed */}
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
                                        
                                        {/* Dynamic Columns Headers */}
                                        {board.columns.map(col => {
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
                                                        <div className="flex items-center gap-2 overflow-hidden">
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
                                                        </div>
                                                    </td>
                                                    
                                                    {board.columns.map(col => {
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
                                                            <div className="flex items-center gap-2 pl-8 overflow-hidden">
                                                                <span className="text-slate-300 text-lg leading-none flex-shrink-0">↳</span>
                                                                <span className="truncate">{subitem.name}</span>
                                                            </div>
                                                        </td>
                                                        
                                                        {board.columns.map(col => {
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
        </div>
    );
}

export default BoardView;