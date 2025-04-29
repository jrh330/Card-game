import { v4 as uuidv4 } from 'uuid';
import { Card, SUITS, RANKS } from '../models/Card';

export const createDeck = (): Card[] => {
    const deck: Card[] = [];
    
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({
                id: uuidv4(),
                suit,
                rank,
                faceUp: false
            });
        }
    }
    
    return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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