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
    grid-template-rows: 1fr auto 1fr;
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
    const [battleCards, setBattleCards] = useState<[CardType | null, CardType | null]>([null, null]);
    const [isWar, setIsWar] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState<Player | null>(null);
    
    useEffect(() => {
        handleNewGame();
    }, []);

    const handleNewGame = () => {
        const deck = shuffleDeck(createDeck());
        const halfDeck = Math.floor(deck.length / 2);
        
        setPlayer1({
            ...player1,
            deck: deck.slice(0, halfDeck),
            warPile: []
        });
        
        setPlayer2({
            ...player2,
            deck: deck.slice(halfDeck),
            warPile: []
        });
        
        setBattleCards([null, null]);
        setIsWar(false);
        setGameOver(false);
        setWinner(null);
    };

    const handleBattle = () => {
        if (player1.deck.length === 0 || player2.deck.length === 0) {
            endGame();
            return;
        }

        const card1 = { ...player1.deck[0], faceUp: true };
        const card2 = { ...player2.deck[0], faceUp: true };
        
        setBattleCards([card1, card2]);
        
        const value1 = getCardValue(card1.rank);
        const value2 = getCardValue(card2.rank);
        
        if (value1 === value2) {
            handleWar();
        } else {
            const winner = value1 > value2 ? player1 : player2;
            const loser = value1 > value2 ? player2 : player1;
            
            // Remove top cards
            const winnerDeck = winner.deck.slice(1);
            const loserDeck = loser.deck.slice(1);
            
            // Add cards to winner's pile
            winnerDeck.push(card1, card2);
            
            if (winner.id === player1.id) {
                setPlayer1({ ...player1, deck: winnerDeck });
                setPlayer2({ ...player2, deck: loserDeck });
            } else {
                setPlayer2({ ...player2, deck: winnerDeck });
                setPlayer1({ ...player1, deck: loserDeck });
            }
        }
    };

    const handleWar = () => {
        setIsWar(true);
        
        // Each player puts 3 cards face down
        const warCards1 = player1.deck.slice(1, 4).map(card => ({ ...card, faceUp: false }));
        const warCards2 = player2.deck.slice(1, 4).map(card => ({ ...card, faceUp: false }));
        
        setPlayer1({ ...player1, warPile: warCards1 });
        setPlayer2({ ...player2, warPile: warCards2 });
    };

    const endGame = () => {
        setGameOver(true);
        setWinner(player1.deck.length > player2.deck.length ? player1 : player2);
    };

    return (
        <GameContainer>
            <h1 style={{ color: 'white' }}>War Card Game</h1>
            <Controls>
                <Button onClick={handleNewGame}>New Game</Button>
                <Button 
                    onClick={handleBattle}
                    disabled={gameOver}
                >
                    {isWar ? "Resolve War" : "Battle!"}
                </Button>
            </Controls>
            
            <Table>
                <PlayerArea>
                    <PlayerStats>
                        {player1.name}: {player1.deck.length} cards
                        {isWar && ` (${player1.warPile.length} cards in war)`}
                    </PlayerStats>
                    {battleCards[0] && <Card card={battleCards[0]} disabled />}
                </PlayerArea>
                
                <BattleArea>
                    {gameOver && (
                        <div style={{ color: 'white', fontSize: '2em' }}>
                            {winner?.name} Wins!
                        </div>
                    )}
                </BattleArea>
                
                <PlayerArea isBottom>
                    <PlayerStats>
                        {player2.name}: {player2.deck.length} cards
                        {isWar && ` (${player2.warPile.length} cards in war)`}
                    </PlayerStats>
                    {battleCards[1] && <Card card={battleCards[1]} disabled />}
                </PlayerArea>
            </Table>
        </GameContainer>
    );
}; 