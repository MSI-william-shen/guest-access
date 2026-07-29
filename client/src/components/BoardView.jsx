import React, { useState, useEffect } from 'react';
import { fetchBoardLayout } from '../api';

function BoardView({ boardId }) {
    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the data when the component mounts or boardId changes
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

    if (loading) return <div style={{ padding: '20px' }}>Loading board layout...</div>;
    if (!board) return <div>Failed to load board.</div>;

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h2>{board.name}</h2>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                {/* 1. RENDER THE COLUMNS (HEADERS) */}
                <thead style={{ backgroundColor: '#f5f6f8', borderBottom: '2px solid #e6e9ef' }}>
                    <tr>
                        <th style={{ padding: '10px' }}>Item Name</th>
                        {board.columns.map(column => (
                            <th key={column.id} style={{ padding: '10px' }}>
                                {column.title}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* 2. RENDER THE GROUPS AND ITEMS */}
                {board.groups.map(group => (
                    <tbody key={group.id}>
                        {/* Group Title Row */}
                        <tr style={{ backgroundColor: '#eef2fc' }}>
                            <td 
                                colSpan={board.columns.length + 1} 
                                style={{ padding: '10px', fontWeight: 'bold', color: '#323338' }}
                            >
                                {group.title}
                            </td>
                        </tr>

                        {/* Items within the Group */}
                        {group.items_page.items.map(item => (
                            <tr 
                                key={item.id} 
                                style={{ borderBottom: '1px solid #e6e9ef', cursor: 'pointer' }}
                                hover="true"
                            >
                                {/* The primary item name */}
                                <td style={{ padding: '10px' }}>{item.name}</td>
                                
                                {/* The dynamic column values */}
                                {item.column_values.map(colVal => (
                                    <td key={colVal.id} style={{ padding: '10px' }}>
                                        {colVal.text || '-'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                ))}
            </table>
        </div>
    );
}

export default BoardView;