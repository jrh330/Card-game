import React from 'react';
import styled from '@emotion/styled';
import { Card as CardType } from '../../models/Card';

interface CardProps {
    card: CardType;
    onClick?: () => void;
    disabled?: boolean;
    selected?: boolean;
}

const CardContainer = styled.div<{ disabled?: boolean; selected?: boolean }>`
    width: 100px;
    height: 140px;
    border-radius: 8px;
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s;
    border: ${props => props.selected ? '3px solid #f1c40f' : '1px solid #bdc3c7'};
    box-shadow: ${props => props.selected ? '0 0 10px #f1c40f' : '0 2px 4px rgba(0,0,0,0.2)'};
    opacity: ${props => props.disabled ? 0.7 : 1};

    &:hover {
        transform: ${props => !props.disabled && 'translateY(-5px)'};
    }
`;

const Suit = styled.div<{ color: string }>`
    font-size: 2em;
    color: ${props => props.color};
`;

const Rank = styled.div<{ color: string }>`
    font-size: 1.5em;
    font-weight: bold;
    color: ${props => props.color};
`;

const getSuitSymbol = (suit: string) => {
    switch (suit.toLowerCase()) {
        case 'hearts': return '♥';
        case 'diamonds': return '♦';
        case 'clubs': return '♣';
        case 'spades': return '♠';
        default: return '';
    }
};

const getSuitColor = (suit: string) => {
    switch (suit.toLowerCase()) {
        case 'hearts':
        case 'diamonds':
            return '#e74c3c';
        case 'clubs':
        case 'spades':
            return '#2c3e50';
        default:
            return 'black';
    }
};

export const Card: React.FC<CardProps> = ({ card, onClick, disabled, selected }) => {
    if (!card.faceUp) {
        return (
            <CardContainer 
                onClick={disabled ? undefined : onClick}
                disabled={disabled}
                selected={selected}
                style={{ background: '#34495e' }}
            />
        );
    }

    const suitSymbol = getSuitSymbol(card.suit);
    const color = getSuitColor(card.suit);

    return (
        <CardContainer 
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            selected={selected}
        >
            <Rank color={color}>{card.rank}</Rank>
            <Suit color={color}>{suitSymbol}</Suit>
        </CardContainer>
    );
}; 