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

const BattleArea = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding: 1rem;
`;

const WinnerMessage = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 2rem 4rem;
    border-radius: 16px;
    font-size: 3em;
    font-family: 'Palatino', 'Garamond', serif;
    z-index: 10;
    text-align: center;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
`;

const Button = styled.button<{ disabled?: boolean }>`
    padding: 1rem 2rem;
    font-size: 1.2em;
    border: none;
    border-radius: 8px;
    background: ${props => props.disabled ? '#bdc3c7' : '#e74c3c'};
    color: white;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s;
    margin-top: 1rem;

    &:hover {
        background: ${props => props.disabled ? '#bdc3c7' : '#c0392b'};
        transform: ${props => !props.disabled && 'scale(1.05)'};
    }
`;

const PlayerStats = styled.div`
    color: white;
    font-size: 1.2em;
    text-align: center;
    margin: 1rem 0;
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
`;

interface GameState extends Player {
    playedCards: CardType[];
    wonCards: CardType[];
}

interface MultiplayerGameState {
    player1: GameState;
    player2: GameState;
    currentTurn: string;
    gameStarted: boolean;
    selectedCards: {
        [playerId: string]: CardType | null;
    };
    battleReady: {
        [playerId: string]: boolean;
    };
    winner: string | null;
}

export const Game: React.FC = () => {
    const [gameId, setGameId] = useState<string | null>(null);
    const [isHost, setIsHost] = useState(false);
    const [gameState, setGameState] = useState<MultiplayerGameState | null>(null);
    const [localPlayer, setLocalPlayer] = useState<GameState | null>(null);
    const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
    const [battleCards, setBattleCards] = useState<[CardType | null, CardType | null]>([null, null]);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState<GameState | null>(null);

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

    const updateLocalPlayerState = (state: MultiplayerGameState) => {
        const playerState = isHost ? state.player1 : state.player2;
        setLocalPlayer(playerState);
        setBattleCards([state.selectedCards[state.player1.id] || null, state.selectedCards[state.player2.id] || null]);
        setGameOver(!!state.winner);
        setWinner(state.winner ? (state.winner === state.player1.id ? state.player1 : state.player2) : null);
    };

    const handleGameStart = (newGameId: string, host: boolean) => {
        setGameId(newGameId);
        setIsHost(host);
        
        if (host) {
            const deck = shuffleDeck(createDeck());
            const initialState: MultiplayerGameState = {
                player1: {
                    ...createPlayer(uuidv4(), "Player 1"),
                    deck: deck.slice(0, 9),
                    playedCards: [],
                    wonCards: []
                },
                player2: {
                    ...createPlayer(uuidv4(), "Player 2"),
                    deck: deck.slice(9),
                    playedCards: [],
                    wonCards: []
                },
                currentTurn: "both",
                gameStarted: false,
                selectedCards: {},
                battleReady: {},
                winner: null
            };
            
            const gameRef = ref(database, `games/${newGameId}/gameState`);
            set(gameRef, initialState);
        }
    };

    const handleCardSelect = (card: CardType) => {
        if (!gameState || !localPlayer) return;
        if (gameOver || localPlayer.playedCards.find(c => c.id === card.id)) return;
        
        if (selectedCard?.id === card.id) {
            setSelectedCard(null);
            const gameRef = ref(database, `games/${gameId}/gameState/selectedCards/${localPlayer.id}`);
            set(gameRef, null);
        } else {
            setSelectedCard(card);
            const gameRef = ref(database, `games/${gameId}/gameState/selectedCards/${localPlayer.id}`);
            set(gameRef, card);
        }
    };

    const handleBattle = async () => {
        if (!gameState || !localPlayer || !selectedCard) return;
        
        const gameRef = ref(database, `games/${gameId}/gameState`);
        const playerKey = isHost ? 'player1' : 'player2';
        const opponentKey = isHost ? 'player2' : 'player1';
        
        // Mark this player as ready for battle
        await set(ref(database, `games/${gameId}/gameState/battleReady/${localPlayer.id}`), true);
        
        // Check if both players are ready
        if (gameState.battleReady[gameState[opponentKey].id]) {
            const player1Card = gameState.selectedCards[gameState.player1.id];
            const player2Card = gameState.selectedCards[gameState.player2.id];
            
            if (!player1Card || !player2Card) return;
            
            const value1 = getCardValue(player1Card.rank);
            const value2 = getCardValue(player2Card.rank);
            
            const player1NewPlayedCards = [...gameState.player1.playedCards, player1Card];
            const player2NewPlayedCards = [...gameState.player2.playedCards, player2Card];
            
            let updatedState = {
                ...gameState,
                player1: {
                    ...gameState.player1,
                    playedCards: player1NewPlayedCards
                },
                player2: {
                    ...gameState.player2,
                    playedCards: player2NewPlayedCards
                },
                selectedCards: {},
                battleReady: {}
            };
            
            if (value1 === value2) {
                // Tie - cards stay in played piles
            } else {
                // Winner takes opponent's card
                const winner = value1 > value2 ? gameState.player1 : gameState.player2;
                const loserCard = value1 > value2 ? player2Card : player1Card;
                
                if (winner.id === gameState.player1.id) {
                    updatedState.player1.wonCards = [...updatedState.player1.wonCards, loserCard];
                } else {
                    updatedState.player2.wonCards = [...updatedState.player2.wonCards, loserCard];
                }
                
                // Check for game over
                if (updatedState.player1.wonCards.length >= 5 || 
                    updatedState.player2.wonCards.length >= 5 ||
                    (player1NewPlayedCards.length === 9 && player2NewPlayedCards.length === 9)) {
                    updatedState.winner = winner.id;
                    
                    // Update scores in the lobby
                    const winnerKey = winner.id === gameState.player1.id ? 'player1Score' : 'player2Score';
                    await set(ref(database, `games/${gameId}/${winnerKey}`), 
                        (await get(ref(database, `games/${gameId}/${winnerKey}`))).val() + 1
                    );
                }
            }
            
            await set(gameRef, updatedState);
        }
    };

    const handleNewGame = async () => {
        if (!gameId || !gameState) return;
        
        const deck = shuffleDeck(createDeck());
        const newState: MultiplayerGameState = {
            ...gameState,
            player1: {
                ...gameState.player1,
                deck: deck.slice(0, 9),
                playedCards: [],
                wonCards: []
            },
            player2: {
                ...gameState.player2,
                deck: deck.slice(9),
                playedCards: [],
                wonCards: []
            },
            selectedCards: {},
            battleReady: {},
            winner: null
        };
        
        const gameRef = ref(database, `games/${gameId}/gameState`);
        await set(gameRef, newState);
    };

    if (!gameId) {
        return <GameLobby onGameStart={handleGameStart} />;
    }

    if (!gameState || !localPlayer) {
        return <div>Loading...</div>;
    }

    const opponent = isHost ? gameState.player2 : gameState.player1;

    return (
        <GameContainer>
            <h1 style={{ color: 'white' }}>Card Game</h1>
            
            <Table>
                <PlayerArea>
                    <PlayerStats>
                        {opponent.name}: {opponent.deck.length - opponent.playedCards.length} cards remaining
                        {opponent.wonCards.length > 0 && ` (Won: ${opponent.wonCards.length})`}
                    </PlayerStats>
                    <PlayArea>
                        <PlayedCards>
                            <PlayedCardsLabel>Played Cards:</PlayedCardsLabel>
                            {opponent.playedCards.map((card) => (
                                <Card key={card.id} card={card} disabled isPlayer1={false} />
                            ))}
                        </PlayedCards>
                        {battleCards[isHost ? 1 : 0] && battleCards[isHost ? 1 : 0] && (
                            <Card 
                                key={battleCards[isHost ? 1 : 0]!.id}
                                card={battleCards[isHost ? 1 : 0]!}
                                disabled 
                                isPlayer1={false} 
                            />
                        )}
                    </PlayArea>
                </PlayerArea>
                
                <BattleArea>
                    {gameOver && (
                        <WinnerMessage>
                            {winner ? `${winner.name} Wins!` : "It's a Tie!"}
                        </WinnerMessage>
                    )}
                    {battleCards[0] && battleCards[1] && !gameOver && (
                        <div style={{ color: 'white', fontSize: '2em' }}>
                            {battleCards[0].rank} vs {battleCards[1].rank}
                        </div>
                    )}
                </BattleArea>
                
                <PlayerArea isBottom>
                    <PlayerStats>
                        {localPlayer.name}: {localPlayer.deck.length - localPlayer.playedCards.length} cards remaining
                        {localPlayer.wonCards.length > 0 && ` (Won: ${localPlayer.wonCards.length})`}
                    </PlayerStats>
                    <CardGrid>
                        {localPlayer.deck.map((card) => {
                            const isPlayed = localPlayer.playedCards.some(c => c.id === card.id);
                            return (
                                <Card 
                                    key={card.id}
                                    card={card}
                                    onClick={() => handleCardSelect(card)}
                                    selected={selectedCard?.id === card.id}
                                    disabled={isPlayed || gameOver}
                                    isPlayer1={true}
                                />
                            );
                        })}
                    </CardGrid>
                    <ButtonContainer>
                        <Button onClick={handleNewGame}>
                            New Game
                        </Button>
                        <Button 
                            onClick={handleBattle}
                            disabled={!selectedCard || gameOver}
                        >
                            Battle!
                        </Button>
                    </ButtonContainer>
                </PlayerArea>
            </Table>
        </GameContainer>
    );
}; 