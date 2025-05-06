console.log('App loaded');
import React from 'react'
import { GameLobby } from './components/GameLobby/GameLobby'

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Card Game</h1>
      <GameLobby />
    </div>
  )
}

export default App
