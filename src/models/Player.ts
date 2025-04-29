import { Card } from './Card';

export interface Player {
    id: string;
    name: string;
    deck: Card[];
    warPile: Card[];
}

export const createPlayer = (id: string, name: string): Player => ({
    id,
    name,
    deck: [],
    warPile: []
}); 