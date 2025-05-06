import React, { useState, useEffect } from 'react'
import { socket } from '../../services/socket'

export const GameLobby = () => {
  const [playerName, setPlayerName] = useState('')
  const [status, setStatus] = useState('Checking connection...')
  const [gameId, setGameId] = useState('')

  useEffect(() => {
    // Connection status handlers
    socket.on('connect', () => {
      setStatus('Connected to server')
      console.log('Connected to server')
    })

    socket.on('gameCreated', (data) => {
      setStatus(`Game created! Room ID: ${data.roomId}`)
      setGameId(data.roomId)
    })

    return () => {
      socket.off('connect')
      socket.off('gameCreated')
    }
  }, [])

  const handleCreateGame = () => {
    if (!playerName.trim()) {
      alert('Please enter your name')
      return
    }
    console.log('Attempting to create game with name:', playerName)
    socket.emit('createGame', { playerName: playerName })
  }
  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Game Lobby</h2>
      <p style={{ 
        color: status.includes('Connected') ? 'green' : 'red',
        fontWeight: 'bold' 
      }}>
        {status}
      </p>
      
      <div style={{ marginTop: '20px' }}>
        <input 
          type="text" 
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button 
          onClick={handleCreateGame}
          style={{ padding: '5px 10px' }}
        >
          Create Game
        </button>
      </div>

      {gameId && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
          <p>Share this Game ID with your opponent: <strong>{gameId}</strong></p>
        </div>
      )}
    </div>
  )
}