import React, { useState, useEffect, useMemo } from 'react';
import { fetchBoardLayout } from '../api';

// AG Grid Imports
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

function BoardView({ boardId }) {
    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);

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

    // Transform monday.com data into multiple groups of AG Grid data
    const { colDefs, groupedTables } = useMemo(() => {
        if (!board || !board.columns) return { colDefs: [], groupedTables: [] };

        // 1. Define Columns (Shared across all tables)
        const columns = [
            { 
                field: 'name', 
                headerName: 'Item Name', 
                pinned: 'left', 
                width: 250,
                cellStyle: {
                    textAlign: "left"
                },
                flex: 1,
                justifyContent: "center"
            }
        ];

        // Dynamically add the rest of the columns (omitting "link")
        board.columns.forEach(col => {
            const lowerCaseTitle = col.title.toLowerCase();
            const columnsToOmit = ["SharePoint Link", "SEND UPDT", "STATUS NOTES", "CREATION LOG", "RESOLVED DATE", "monday Doc v2",  "XREF TEXT", "DISPOSITION", "Main Item ID", "Item ID", "Name", "Group", "Subitems" ]
            if (lowerCaseTitle.includes('link')) {
                return; // Skip link columns
            }
            if (columnsToOmit.includes(col.title)){
                return;
            }

            columns.push({
                field: col.id, 
                headerName: col.title,
                minWidth: 120,
                textAlign: "center"
                
            });
        });

        // 2. Define Table Data Per Group
        const groups = board.groups
            // 🛑 BULLETPROOF FILTER: Check both title and ID for "subitem"
            .filter(group => {
                const titleMatch = group.title ? group.title.toLowerCase().includes('subitem') : false;
                const idMatch = group.id ? group.id.toLowerCase().includes('subitem') : false;
                
                // Keep the group ONLY if it is NOT a subitem title and NOT a subitem ID
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

    // AG Grid default column settings
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
    
    if (!board || !board.columns) {
        return (
            <div style={{ padding: '20px', color: 'red' }}>
                Failed to load board. Open your browser console (F12) to see what went wrong.
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h2 style={{ marginBottom: '25px', textAlign: 'center'}}>{board.name}</h2>
            
            {/* Map through each group and create a separate table */}
            {groupedTables.map(group => (
                <div key={group.id} style={{ marginBottom: '40px', flex: 1, justifyContent: "center" }}>
                    
                    {/* Group Header */}
                    <h3 style={{ 
                        backgroundColor: '#eef2fc', 
                        padding: '10px 15px', 
                        borderRadius: '5px',
                        color: '#323338',
                        margin: '0 0 10px 0',
                        fontSize: '18px',
                        textAlign: "center"
                    }}>
                        {group.title}
                    </h3>
                    
                    {/* AG Grid Instance for this specific group */}
                    <div className="ag-theme-quartz" style={{ width: '100%', flex: 1, justifyContent: "start", textAlign: "left" }}>
                        <AgGridReact
                            rowData={group.rowData}
                            columnDefs={colDefs}
                            defaultColDef={defaultColDef}
                            rowSelection="single"
                            animateRows={true}
                            // autoHeight prevents double-scrollbars by sizing the grid to its rows
                            domLayout="autoHeight" 
                            enableCellTextSelection={true}
                        />
                    </div>
                    
                </div>
            ))}
        </div>
    );
}

export default BoardView;