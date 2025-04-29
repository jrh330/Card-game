import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Card as CardType, getCardValue } from '../../models/Card';
import { Player, createPlayer } from '../../models/Player';
import { Card } from '../Card/Card';
import { createDeck, shuffleDeck } from '../../utils/deck';
import { v4 as uuidv4 } from 'uuid';

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

interface PlayerState extends Player {
    playedCards: CardType[];
    wonCards: CardType[];
}

export const Game: React.FC = () => {
    const [player1, setPlayer1] = useState<PlayerState>({
        ...createPlayer(uuidv4(), "Player 1"),
        playedCards: [],
        wonCards: []
    });
    const [player2, setPlayer2] = useState<PlayerState>({
        ...createPlayer(uuidv4(), "Player 2"),
        playedCards: [],
        wonCards: []
    });
    const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
    const [battleCards, setBattleCards] = useState<[CardType | null, CardType | null]>([null, null]);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState<PlayerState | null>(null);
    
    useEffect(() => {
        handleNewGame();
    }, []);

    const handleNewGame = () => {
        const deck = shuffleDeck(createDeck());
        
        setPlayer1({
            ...createPlayer(uuidv4(), "Player 1"),
            deck: deck.slice(0, 9),
            playedCards: [],
            wonCards: []
        });
        
        setPlayer2({
            ...createPlayer(uuidv4(), "Player 2"),
            deck: deck.slice(9),
            playedCards: [],
            wonCards: []
        });
        
        setBattleCards([null, null]);
        setSelectedCard(null);
        setGameOver(false);
        setWinner(null);
    };

    const handleCardSelect = (card: CardType) => {
        if (!selectedCard && !gameOver && !player1.playedCards.find(c => c.id === card.id)) {
            setSelectedCard(card);
        }
    };

    const handleBattle = () => {
        if (!selectedCard || gameOver || player2.deck.length === 0) return;

        // Get a random unplayed card from player 2
        const availableCards = player2.deck.filter(card => 
            !player2.playedCards.find(played => played.id === card.id)
        );
        
        if (availableCards.length === 0) {
            setGameOver(true);
            determineWinner();
            return;
        }

        const randomIndex = Math.floor(Math.random() * availableCards.length);
        const player2Card = { ...availableCards[randomIndex], faceUp: true };
        
        setBattleCards([selectedCard, player2Card]);
        
        const value1 = getCardValue(selectedCard.rank);
        const value2 = getCardValue(player2Card.rank);
        
        // Add cards to played piles
        const player1NewPlayedCards = [...player1.playedCards, selectedCard];
        const player2NewPlayedCards = [...player2.playedCards, player2Card];
        
        if (value1 === value2) {
            // Tie - cards stay in played piles
            setPlayer1({
                ...player1,
                playedCards: player1NewPlayedCards
            });
            setPlayer2({
                ...player2,
                playedCards: player2NewPlayedCards
            });
        } else {
            // Winner takes both cards
            const winner = value1 > value2 ? player1 : player2;
            const newWonCards = [...winner.wonCards, selectedCard, player2Card];
            
            if (winner.id === player1.id) {
                setPlayer1({
                    ...player1,
                    playedCards: player1NewPlayedCards,
                    wonCards: newWonCards
                });
                setPlayer2({
                    ...player2,
                    playedCards: player2NewPlayedCards
                });
            } else {
                setPlayer2({
                    ...player2,
                    playedCards: player2NewPlayedCards,
                    wonCards: newWonCards
                });
                setPlayer1({
                    ...player1,
                    playedCards: player1NewPlayedCards
                });
            }
        }
        
        setSelectedCard(null);
        determineWinner();
    };

    const determineWinner = () => {
        const p1Score = player1.wonCards.length;
        const p2Score = player2.wonCards.length;
        
        if (p1Score >= 5) {
            setWinner(player1);
            setGameOver(true);
        } else if (p2Score >= 5) {
            setWinner(player2);
            setGameOver(true);
        } else if (p1Score === 4 && p2Score === 4 && player1.playedCards.length === 9) {
            // It's a tie
            setGameOver(true);
        }
    };

    return (
        <GameContainer>
            <h1 style={{ color: 'white' }}>Card Game</h1>
            
            <Table>
                <PlayerArea>
                    <PlayerStats>
                        {player2.name}: {player2.deck.length - player2.playedCards.length} cards remaining
                        {player2.wonCards.length > 0 && ` (Won: ${player2.wonCards.length})`}
                    </PlayerStats>
                    <PlayArea>
                        <PlayedCards>
                            <PlayedCardsLabel>Played Cards:</PlayedCardsLabel>
                            {player2.playedCards.map((card) => (
                                <Card key={card.id} card={card} disabled isPlayer1={false} />
                            ))}
                        </PlayedCards>
                        {battleCards[1] && (
                            <Card card={battleCards[1]} disabled isPlayer1={false} />
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
                        {player1.name}: {player1.deck.length - player1.playedCards.length} cards remaining
                        {player1.wonCards.length > 0 && ` (Won: ${player1.wonCards.length})`}
                    </PlayerStats>
                    <CardGrid>
                        {player1.deck.map((card) => {
                            const isPlayed = player1.playedCards.some(c => c.id === card.id);
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