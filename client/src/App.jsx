import React from 'react';
import BoardView from './components/BoardView.jsx';

function App() {
  // Replace this with a real board ID from your workspace
  const TEST_BOARD_ID = "8709896145"; 

  return (
    <div>
      <header style={{ padding: '15px 20px', backgroundColor: '#323338', color: 'white' }}>
        <h1>My Custom Portal</h1>
      </header>
      
      <main>
        <BoardView boardId={TEST_BOARD_ID} />
      </main>
    </div>
  );
}

export default App;