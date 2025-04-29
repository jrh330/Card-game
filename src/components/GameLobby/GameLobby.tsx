import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { ref, set, onValue, off } from 'firebase/database';
import { database } from '../../firebase';
import { v4 as uuidv4 } from 'uuid';

const LobbyContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    gap: 1rem;
    background: #2c3e50;
    min-height: 100vh;
    color: white;
`;

const Input = styled.input`
    padding: 0.5rem 1rem;
    font-size: 1.2em;
    border: none;
    border-radius: 4px;
    width: 300px;
    margin: 0.5rem 0;
`;

const Button = styled.button`
    padding: 1rem 2rem;
    font-size: 1.2em;
    border: none;
    border-radius: 8px;
    background: #e74c3c;
    color: white;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: #c0392b;
        transform: scale(1.05);
    }
`;

const InviteLink = styled.div`
    padding: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    margin: 1rem 0;
    word-break: break-all;
`;

const ScoreBoard = styled.div`
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 8px;
    margin-top: 2rem;
    text-align: center;
`;

interface GameLobbyProps {
    onGameStart: (gameId: string, isHost: boolean) => void;
}

interface GameState {
    player1Name: string;
    player2Name: string;
    player1Score: number;
    player2Score: number;
}

export const GameLobby: React.FC<GameLobbyProps> = ({ onGameStart }) => {
    const [playerName, setPlayerName] = useState('');
    const [gameId, setGameId] = useState('');
    const [isHost, setIsHost] = useState(true);
    const [gameState, setGameState] = useState<GameState | null>(null);

    useEffect(() => {
        // Check if there's a game ID in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const gameIdParam = urlParams.get('gameId');
        if (gameIdParam) {
            setGameId(gameIdParam);
            setIsHost(false);
        }
    }, []);

    useEffect(() => {
        if (gameId) {
            const gameRef = ref(database, `games/${gameId}`);
            onValue(gameRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setGameState(data);
                }
            });

            return () => {
                off(gameRef);
            };
        }
    }, [gameId]);

    const createGame = async () => {
        if (!playerName.trim()) return;
        
        const newGameId = uuidv4();
        const gameRef = ref(database, `games/${newGameId}`);
        
        await set(gameRef, {
            player1Name: playerName,
            player2Name: '',
            player1Score: 0,
            player2Score: 0
        });

        setGameId(newGameId);
        window.history.pushState({}, '', `?gameId=${newGameId}`);
        onGameStart(newGameId, true);
    };

    const joinGame = async () => {
        if (!playerName.trim() || !gameId) return;
        
        const gameRef = ref(database, `games/${gameId}`);
        await set(gameRef, {
            ...gameState,
            player2Name: playerName
        });

        onGameStart(gameId, false);
    };

    const getInviteLink = () => {
        return `${window.location.origin}${window.location.pathname}?gameId=${gameId}`;
    };

    if (!isHost && !gameState) {
        return (
            <LobbyContainer>
                <h2>Join Game</h2>
                <Input
                    type="text"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                />
                <Button onClick={joinGame}>Join Game</Button>
            </LobbyContainer>
        );
    }

    return (
        <LobbyContainer>
            <h2>{isHost ? 'Create Game' : 'Join Game'}</h2>
            <Input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
            />
            {isHost ? (
                <Button onClick={createGame}>Create Game</Button>
            ) : (
                <Button onClick={joinGame}>Join Game</Button>
            )}

            {gameId && isHost && (
                <>
                    <h3>Share this link with your opponent:</h3>
                    <InviteLink>{getInviteLink()}</InviteLink>
                    {gameState?.player2Name && (
                        <div>
                            <h3>Opponent joined:</h3>
                            <p>{gameState.player2Name}</p>
                        </div>
                    )}
                </>
            )}

            {gameState && (
                <ScoreBoard>
                    <h3>Score Board</h3>
                    <p>{gameState.player1Name}: {gameState.player1Score}</p>
                    <p>{gameState.player2Name || 'Waiting for opponent'}: {gameState.player2Score}</p>
                </ScoreBoard>
            )}
        </LobbyContainer>
    );
}; 