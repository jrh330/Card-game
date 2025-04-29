import { Card, Suit, Rank } from '../models/Card';

export const createDeck = (): Card[] => {
    const player1Cards: Card[] = [];
    const player2Cards: Card[] = [];
    
    // Create cards 2-9 for Player 1 (Hearts)
    for (let i = 2; i <= 9; i++) {
        player1Cards.push({
            id: `hearts-${i}`,
            suit: 'hearts' as Suit,
            rank: i.toString() as Rank,
            faceUp: true
        });
    }
    
    // Create cards 2-9 for Player 2 (Spades)
    for (let i = 2; i <= 9; i++) {
        player2Cards.push({
            id: `spades-${i}`,
            suit: 'spades' as Suit,
            rank: i.toString() as Rank,
            faceUp: false
        });
    }
    
    return [...player1Cards, ...player2Cards];
};

export const shuffleDeck = (deck: Card[]): Card[] => {
    // For this game version, we don't shuffle the entire deck
    // We only shuffle Player 2's cards
    const player1Cards = deck.slice(0, 9);
    const player2Cards = deck.slice(9);
    
    // Fisher-Yates shuffle for Player 2's cards
    for (let i = player2Cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [player2Cards[i], player2Cards[j]] = [player2Cards[j], player2Cards[i]];
    }
    
    return [...player1Cards, ...player2Cards];
};

export const dealCards = (deck: Card[], numCards: number): [Card[], Card[]] => {
    const dealt = deck.slice(0, numCards).map(card => ({ ...card, faceUp: true }));
    const remaining = deck.slice(numCards);
    return [dealt, remaining];
};

export const flipCard = (card: Card): Card => {
    return {
        ...card,
        faceUp: !card.faceUp
    };
}; 