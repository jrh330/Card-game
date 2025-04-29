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

const BattleArea = styled.div`
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding: 1rem;
`;

const Controls = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
`;

const Button = styled.button`
    padding: 0.8rem 1.5rem;
    font-size: 1.1em;
    border: none;
    border-radius: 4px;
    background: #3498db;
    color: white;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
        background: #2980b9;
    }

    &:disabled {
        background: #bdc3c7;
        cursor: not-allowed;
    }
`;

const PlayerStats = styled.div`
    color: white;
    font-size: 1.2em;
    text-align: center;
    margin: 1rem 0;
`;

export const Game: React.FC = () => {
    const [player1, setPlayer1] = useState<Player>(createPlayer(uuidv4(), "Player 1"));
    const [player2, setPlayer2] = useState<Player>(createPlayer(uuidv4(), "Player 2"));
    const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
    const [battleCards, setBattleCards] = useState<[CardType | null, CardType | null]>([null, null]);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState<Player | null>(null);
    
    useEffect(() => {
        handleNewGame();
    }, []);

    const handleNewGame = () => {
        const deck = shuffleDeck(createDeck());
        
        setPlayer1({
            ...player1,
            deck: deck.slice(0, 9),
        });
        
        setPlayer2({
            ...player2,
            deck: deck.slice(9),
        });
        
        setBattleCards([null, null]);
        setSelectedCard(null);
        setGameOver(false);
        setWinner(null);
    };

    const handleCardSelect = (card: CardType) => {
        if (!selectedCard && !gameOver) {
            setSelectedCard(card);
        }
    };

    const handleBattle = () => {
        if (!selectedCard || gameOver) return;

        // Get a random card from player 2
        const randomIndex = Math.floor(Math.random() * player2.deck.length);
        const player2Card = { ...player2.deck[randomIndex], faceUp: true };
        
        setBattleCards([selectedCard, player2Card]);
        
        const value1 = getCardValue(selectedCard.rank);
        const value2 = getCardValue(player2Card.rank);
        
        // Remove the played cards from both decks
        const player1NewDeck = player1.deck.filter(card => card.id !== selectedCard.id);
        const player2NewDeck = player2.deck.filter(card => card.id !== player2Card.id);
        
        if (value1 === value2) {
            // Cards are tied, leave them in the battle area
            setPlayer1({ ...player1, deck: player1NewDeck });
            setPlayer2({ ...player2, deck: player2NewDeck });
            setSelectedCard(null);
        } else {
            const winner = value1 > value2 ? player1 : player2;
            const winnerNewDeck = winner.id === player1.id 
                ? [...player1NewDeck, selectedCard, player2Card]
                : [...player2NewDeck, selectedCard, player2Card];
            
            if (winner.id === player1.id) {
                setPlayer1({ ...player1, deck: winnerNewDeck });
                setPlayer2({ ...player2, deck: player2NewDeck });
            } else {
                setPlayer2({ ...player2, deck: winnerNewDeck });
                setPlayer1({ ...player1, deck: player1NewDeck });
            }
            
            setSelectedCard(null);
            setBattleCards([null, null]);
            
            // Check for game over
            if (winnerNewDeck.length >= 14) {
                setGameOver(true);
                setWinner(winner);
            }
        }
    };

    return (
        <GameContainer>
            <h1 style={{ color: 'white' }}>Card Game</h1>
            <Controls>
                <Button onClick={handleNewGame}>New Game</Button>
                <Button 
                    onClick={handleBattle}
                    disabled={!selectedCard || gameOver}
                >
                    Battle!
                </Button>
            </Controls>
            
            <Table>
                <PlayerArea>
                    <PlayerStats>
                        {player2.name}: {player2.deck.length} cards
                    </PlayerStats>
                    {battleCards[1] && <Card card={battleCards[1]} disabled />}
                </PlayerArea>
                
                <BattleArea>
                    {gameOver ? (
                        <div style={{ color: 'white', fontSize: '2em' }}>
                            {winner?.name} Wins!
                        </div>
                    ) : (
                        battleCards[0] && battleCards[1] && (
                            <div style={{ color: 'white', fontSize: '2em' }}>
                                {battleCards[0].rank} vs {battleCards[1].rank}
                            </div>
                        )
                    )}
                </BattleArea>
                
                <PlayerArea isBottom>
                    <PlayerStats>
                        {player1.name}: {player1.deck.length} cards
                    </PlayerStats>
                    <CardGrid>
                        {player1.deck.map((card) => (
                            <Card 
                                key={card.id}
                                card={card}
                                onClick={() => handleCardSelect(card)}
                                selected={selectedCard?.id === card.id}
                                disabled={gameOver}
                            />
                        ))}
                    </CardGrid>
                </PlayerArea>
            </Table>
        </GameContainer>
    );
}; 