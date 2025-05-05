import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Card as CardType, getCardValue } from '../../models/Card';
import { Player, createPlayer } from '../../models/Player';
import { Card } from '../Card/Card';
import { createDeck, shuffleDeck } from '../../utils/deck';
import { v4 as uuidv4 } from 'uuid';
import { ref, set, onValue, off, get } from 'firebase/database';
import { database } from '../../firebase';
import { GameLobby } from '../GameLobby/GameLobby';

const GameContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    min-height: 100vh;
    background: #2c3e50;
`;

const Table = styled.div`
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 2rem;
    padding: 2rem;
    background: #27ae60;
    border-radius: 16px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    margin: 2rem;
    min-width: 80vw;
    min-height: 60vh;
    position: relative;
`;

const PlayerArea = styled.div<{ isBottom?: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    ${props => props.isBottom ? 'margin-top: auto;' : ''}
`;

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 1rem;
    padding: 1rem;
    width: 100%;
`;

const PlayArea = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    width: 100%;
    padding: 1rem;
`;

const PlayedCards = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    min-height: 160px;
`;

const PlayedCardsLabel = styled.div`
    color: white;
    font-size: 1em;
    margin-bottom: 0.5rem;
`;

// ... (other utility functions and types as needed)

export const Game: React.FC = () => {
    // Example state hooks (customize as needed for your game logic)
    const [gameId, setGameId] = useState<string | null>(null);
    const [isHost, setIsHost] = useState(false);
    const [gameState, setGameState] = useState<any>(null);
    const [localPlayer, setLocalPlayer] = useState<any>(null);
    const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
    const [battleCards, setBattleCards] = useState<[CardType | null, CardType | null]>([null, null]);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState<any>(null);

    useEffect(() => {
        if (gameId) {
            const gameRef = ref(database, `games/${gameId}/gameState`);
            onValue(gameRef, (snapshot: any) => {
                const data = snapshot.val();
                if (data) {
                    setGameState(data);
                    updateLocalPlayerState(data);
                }
            });

            return () => {
                off(gameRef);
            };
        }
    }, [gameId]);

    const updateLocalPlayerState = (state: any) => {
        // Example logic, adjust for your actual state structure
        const playerState = isHost ? state.player1 : state.player2;
        setLocalPlayer(playerState);
        setBattleCards([state.selectedCards[state.player1.id] || null, state.selectedCards[state.player2.id] || null]);
        setGameOver(!!state.winner);
        setWinner(state.winner ? (state.winner === state.player1.id ? state.player1 : state.player2) : null);
    };

    // ... (other handlers and game logic)

    if (!gameId) {
        return <GameLobby onGameStart={setGameId} />;
    }

    if (!gameState || !localPlayer) {
        return <div>Loading...</div>;
    }

    // ... (render the game UI)

    return (
        <GameContainer>
            <Table>
                {/* Render player areas, play area, etc. */}
                <PlayerArea isBottom>
                    {/* Player's hand, etc. */}
                </PlayerArea>
                <PlayArea>
                    {/* Played cards, actions, etc. */}
                </PlayArea>
                <PlayerArea>
                    {/* Opponent's hand, etc. */}
                </PlayerArea>
            </Table>
            {gameOver && winner && (
                <div>
                    <h2>Game Over! Winner: {winner.name}</h2>
                </div>
            )}
        </GameContainer>
    );
};