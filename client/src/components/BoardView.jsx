import React, { useState, useEffect, useMemo } from 'react';
import { fetchBoardLayout } from '../api';

// AG Grid Imports
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid styling
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Modern theme

function BoardView({ boardId }) {
    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBoardLayout(boardId)
            .then(data => {
                console.log("Data from backend:", data);
                setBoard(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching board:", err);
                setLoading(false);
            });
    }, [boardId]);

    // Transform monday.com data into AG Grid format
    const { rowData, colDefs } = useMemo(() => {
        if (!board || !board.columns) return { rowData: [], colDefs: [] };

        // 1. Define Columns
        const columns = [
            { 
                field: 'group', 
                headerName: 'Group', 
                width: 150,
                // Keeps groups organized nicely
                sort: 'asc' 
            },
            { 
                field: 'name', 
                headerName: 'Item Name', 
                pinned: 'left', // Pins the name to the left when scrolling horizontally
                width: 250
            }
        ];

        // Dynamically add the rest of the monday.com columns
        board.columns.forEach(col => {
            columns.push({
                field: col.id, // We use the unique column ID as the data key
                headerName: col.title,
                minWidth: 120,
                flex: 1 // Allows columns to stretch and fill empty space
            });
        });

        // 2. Define Rows (Flattening the nested groups/items)
        const rows = [];
        board.groups.forEach(group => {
            group.items_page.items.forEach(item => {
                // Base row object
                const row = {
                    id: item.id,
                    group: group.title,
                    name: item.name
                };

                // Map dynamic column values to this row
                item.column_values.forEach(colVal => {
                    row[colVal.id] = colVal.text || '-'; // Fallback for empty cells
                });

                rows.push(row);
            });
        });

        return { rowData: rows, colDefs: columns };
    }, [board]);

    // AG Grid default column settings (applies to all columns)
    const defaultColDef = useMemo(() => {
        return {
            sortable: true,
            filter: true,
            resizable: true,
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
        <div style={{ padding: '20px', fontFamily: 'sans-serif', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ marginBottom: '15px' }}>{board.name}</h2>
            
            {/* 
              AG Grid requires a wrapper div with a specific height and theme class. 
              We use flex-grow to ensure it takes up the remainder of the screen.
            */}
            <div 
                className="ag-theme-quartz" 
                style={{ flexGrow: 1, width: '100%', minHeight: '500px' }}
            >
                <AgGridReact
                    rowData={rowData}
                    columnDefs={colDefs}
                    defaultColDef={defaultColDef}
                    rowSelection="single" // Allows clicking a row (useful for opening comments later)
                    animateRows={true}
                    pagination={true}
                    paginationPageSize={20}
                />
            </div>
        </div>
    );
}

export default BoardView;