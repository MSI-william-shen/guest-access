import React, { useState, useEffect, useMemo } from 'react';
import { fetchBoardLayout } from '../api';
import CommentsModal from './CommentsModal'; // 🛑 NEW IMPORT

// Styles
import './BoardView.css'; 

// AG Grid Imports
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

function BoardView({ boardId }) {
    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [activeItem, setActiveItem] = useState(null); 
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchBoardLayout(boardId)
            .then(data => {
                setBoard(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching board:", err);
                setLoading(false);
            });
    }, [boardId]);

    const openComments = (item) => {
        setActiveItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setActiveItem(null);
    };

    const { colDefs, groupedTables } = useMemo(() => {
        if (!board || !board.columns) return { colDefs: [], groupedTables: [] };

        const columns = [
            { 
                field: 'name', 
                headerName: 'Item Name', 
                pinned: 'left', 
                width: 250,
                flex: 1,
                cellRenderer: (params) => {
                    return (
                        <div className="cell-name-container">
                            <span className="cell-name-text">
                                {params.value}
                            </span>
                            <button 
                                onClick={() => openComments(params.data)}
                                className="comment-button"
                                title="View Updates"
                            >
                                💬
                            </button>
                        </div>
                    );
                }
            }
        ];

        board.columns.forEach(col => {
            const lowerCaseTitle = col.title.toLowerCase();
            const columnsToOmit = ["SharePoint Link", "SEND UPDT", "STATUS NOTES", "CREATION LOG", "RESOLVED DATE", "monday Doc v2",  "XREF TEXT", "DISPOSITION", "Main Item ID", "Item ID", "Name", "Group", "Subitems" ];
            
            if (lowerCaseTitle.includes('link')) return; 
            if (columnsToOmit.includes(col.title)) return;

            columns.push({
                field: col.id, 
                headerName: col.title,
                minWidth: 120
            });
        });

        const groups = board.groups
            .filter(group => {
                const titleMatch = group.title ? group.title.toLowerCase().includes('subitem') : false;
                const idMatch = group.id ? group.id.toLowerCase().includes('subitem') : false;
                return !titleMatch && !idMatch;
            })
            .map(group => {
                const rows = group.items_page.items.map(item => {
                    const row = {
                        id: item.id,
                        name: item.name
                    };

                    item.column_values.forEach(colVal => {
                        row[colVal.id] = colVal.text || '-'; 
                    });

                    return row;
                });

                return {
                    id: group.id,
                    title: group.title,
                    rowData: rows
                };
            });

        return { colDefs: columns, groupedTables: groups };
    }, [board]);

    const defaultColDef = useMemo(() => {
        return {
            sortable: true,
            filter: true,
            resizable: true,
            flex: 1,
            cellStyle: { textAlign: 'left' }
        };
    }, []);

    if (loading) return <div style={{ padding: '20px' }}>Loading board layout...</div>;
    if (!board || !board.columns) return <div style={{ padding: '20px', color: 'red' }}>Failed to load board.</div>;

    return (
        <div className="board-view-container">
            <h2 className="board-title">{board.name}</h2>
            
            {groupedTables.map(group => (
                <div key={group.id} className="group-container">
                    <h3 className="group-header">
                        {group.title}
                    </h3>
                    
                    <div className="ag-theme-quartz grid-wrapper">
                        <AgGridReact
                            rowData={group.rowData}
                            columnDefs={colDefs}
                            defaultColDef={defaultColDef}
                            rowSelection="single"
                            animateRows={true}
                            domLayout="autoHeight" 
                            enableCellTextSelection={true}
                        />
                    </div>
                </div>
            ))}

            {/* 🛑 DELEGATED TO COMPONENT */}
            <CommentsModal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                item={activeItem} 
            />
            
        </div>
    );
}

export default BoardView;