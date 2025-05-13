import React, { useState, useEffect } from 'react';

// Change to default export
const GameLobby: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [gameCreated, setGameCreated] = useState(false);
  const [error, setError] = useState('');

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
      } else {
        setError('Failed to create game');
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
      } else {
        setError('Failed to join game');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="game-lobby">
      <h2>Game Lobby</h2>
      {error && <div className="error">{error}</div>}
      
      <div className="input-group">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>

      {!gameCreated ? (
        <button onClick={handleCreateGame}>Create Game</button>
      ) : (
        <div className="room-info">
          <p>Room ID: {roomId}</p>
          <p>Share this ID with your opponent</p>
        </div>
      )}

      <div className="join-game">
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter room ID to join"
        />
        <button onClick={handleJoinGame}>Join Game</button>
      </div>
    </div>
  );
};

export { default } from './GameLobby';