import React, { useState, useEffect } from 'react';
import { fetchItemUpdates, postItemUpdate } from '../api';
import './CommentsModal.css';

function CommentsModal({ isOpen, onClose, item }) {
    const [updates, setUpdates] = useState([]);
    const [updatesLoading, setUpdatesLoading] = useState(false);
    const [newUpdateText, setNewUpdateText] = useState("");

    // Fetch comments whenever the modal is opened for a specific item
    useEffect(() => {
        if (isOpen && item) {
            loadUpdates();
        } else {
            // Clean up state when modal closes
            setUpdates([]);
            setNewUpdateText("");
        }
    }, [isOpen, item]);
    //Auto-Scroll to the bottom of the comments section
    const chronologyRef = React.useRef(null);
    useEffect(() => {
        if (chronologyRef.current) {
            chronologyRef.current.scrollTop = chronologyRef.current.scrollHeight;
        }
    }, [updates]);

    const loadUpdates = () => {
        setUpdatesLoading(true);
        fetchItemUpdates(item.id)
            .then(data => {
                setUpdates(data);
                setUpdatesLoading(false);
            })
            .catch(err => {
                console.error("Error fetching updates:", err);
                setUpdatesLoading(false);
            });
    };

    const handlePostUpdate = async () => {
        if (!newUpdateText.trim()) return;
        
        try {
            await postItemUpdate(item.id, newUpdateText);
            setNewUpdateText(""); // Clear the text box
            loadUpdates(); // Refresh the list to show the new comment
        } catch (error) {
            console.error("Failed to post update:", error);
            alert("Failed to post comment.");
        }
    };

    // If modal is not open, don't render anything
    if (!isOpen || !item) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                
                <div className="modal-header">
                    <h3 className="modal-title">Updates for: {item.name}</h3>
                    <button onClick={onClose} className="modal-close-button">✖</button>
                </div>

                {/* Chronology View */}
                <div className="chronology-container" ref = {chronologyRef}>
                    {updatesLoading ? (
                        <p className="chronology-placeholder">Loading comment chronology...</p>
                    ) : updates.length === 0 ? (
                        <p className="chronology-placeholder">No updates yet. Be the first to post!</p>
                    ) : (
                        [...updates].reverse().map(update => (
                        <div key={update.id} className="update-card">
                                <div className="update-header">
                                    {update.creator?.photo_thumb_small ? (
                                        <img src={update.creator.photo_thumb_small} alt="avatar" className="update-avatar" />
                                    ) : (
                                        <div className="update-avatar" style={{ backgroundColor: '#eef2fc', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px' }}>
                                            🤖
                                        </div>
                                    )}
                                    <strong>{update.creator?.name || 'System / Automation'}</strong>
                                    <span className="update-timestamp">
                                        {new Date(update.created_at).toLocaleString()}
                                    </span>
                                </div>
                                
                                <div dangerouslySetInnerHTML={{ __html: update.body }} className="update-body" />
                                
                                {update.assets && update.assets.length > 0 && (
                                    <div className="update-assets">
                                        {update.assets.map(asset => (
                                            <a key={asset.id} href={asset.public_url} target="_blank" rel="noreferrer" className="asset-link">
                                                📎 {asset.name}
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {/* 🛑 NEW: Render Replies (Subcomments) */}
                                {update.replies && update.replies.length > 0 && (
                                    <div className="replies-container">
                                        {/* We reverse the replies so the oldest reply is at the top of the thread */}
                                        {[...update.replies].reverse().map(reply => (
                                            <div key={reply.id} className="reply-card">
                                                <div className="update-header" style={{ marginBottom: '5px' }}>
                                                    {reply.creator?.photo_thumb_small ? (
                                                        <img src={reply.creator.photo_thumb_small} alt="avatar" className="update-avatar" style={{ width: '20px', height: '20px' }} />
                                                    ) : (
                                                        <div className="update-avatar" style={{ backgroundColor: '#eef2fc', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px', width: '20px', height: '20px' }}>
                                                            🤖
                                                        </div>
                                                    )}
                                                    <strong style={{ fontSize: '13px' }}>{reply.creator?.name || 'System'}</strong>
                                                    <span className="update-timestamp" style={{ fontSize: '11px' }}>
                                                        {new Date(reply.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div dangerouslySetInnerHTML={{ __html: reply.body }} className="update-body" style={{ fontSize: '13px' }} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Input Area */}
                <div className="input-area">
                    <textarea 
                        placeholder="Write an update..." 
                        className="update-textarea"
                        value={newUpdateText}
                        onChange={(e) => setNewUpdateText(e.target.value)}
                    />
                    <div className="modal-actions">
                        <input type="file" className="file-input" title="File uploads coming soon" />
                        <button className="submit-button" onClick={handlePostUpdate}>
                            Post Update
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default CommentsModal;