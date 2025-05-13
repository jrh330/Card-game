import React, { useState, useEffect } from 'react';

const GameLobby: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [gameCreated, setGameCreated] = useState(false);
  const [error, setError] = useState('');
  const [gameState, setGameState] = useState<any>(null);

  useEffect(() => {
    // Test server connection
    fetch('https://card-game-webservice.onrender.com/health')
      .then(response => response.json())
      .then(data => console.log('Server health check:', data))
      .catch(error => console.error('Server health check failed:', error));
  }, []);

  const handleCreateGame = async () => {
    console.log('Attempting to create game with name:', playerName);
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      const response = await fetch('https://card-game-webservice.onrender.com/api/create-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerName }),
      });

      const data = await response.json();
      console.log('Create game response:', data);

      if (data.success) {
        setRoomId(data.roomId);
        setGameCreated(true);
        setError('');
      } else {
        setError(data.error || 'Failed to create game');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      setError('Failed to connect to server');
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim() || !roomId.trim()) {
      setError('Please enter both your name and room ID');
      return;
    }

    try {
      const response = await fetch('https://card-game-webservice.onrender.com/api/join-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId, playerName }),
      });

      const data = await response.json();
      console.log('Join game response:', data);

      if (data.success) {
        setGameCreated(true);
        setGameState(data.room);
        setError('');
      } else {
        setError(data.error || 'Failed to join game');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="game-lobby">
      <h2>Game Lobby</h2>
      {error && <div className="error" style={{ color: 'red', margin: '10px 0' }}>{error}</div>}
      
      <div className="input-group" style={{ margin: '10px 0' }}>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          style={{ padding: '5px', marginRight: '10px' }}
        />
      </div>

      {!gameCreated ? (
        <button 
          onClick={handleCreateGame}
          style={{ 
            padding: '5px 10px',
            margin: '10px 0',
            cursor: 'pointer'
          }}
        >
          Create Game
        </button>
      ) : (
        <div className="room-info" style={{ margin: '10px 0' }}>
          <p>Room ID: {roomId}</p>
          <p>Share this ID with your opponent</p>
        </div>
      )}

      <div className="join-game" style={{ margin: '10px 0' }}>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter room ID to join"
          style={{ padding: '5px', marginRight: '10px' }}
        />
        <button 
          onClick={handleJoinGame}
          style={{ 
            padding: '5px 10px',
            cursor: 'pointer'
          }}
        >
          Join Game
        </button>
      </div>

      {gameState && (
        <div className="game-state" style={{ margin: '20px 0', padding: '10px', border: '1px solid #ccc' }}>
          <h3>Game Status: {gameState.status}</h3>
          <h4>Players:</h4>
          <ul>
            {gameState.players.map((player: any) => (
              <li key={player.id}>{player.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GameLobby;