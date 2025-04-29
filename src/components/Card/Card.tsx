import React from 'react';
import styled from '@emotion/styled';
import { Card as CardType } from '../../models/Card';

interface CardProps {
    card: CardType;
    onClick?: () => void;
    disabled?: boolean;
    selected?: boolean;
    isPlayer1?: boolean;
}

const CardContainer = styled.div<{ disabled?: boolean; selected?: boolean; isPlayer1?: boolean }>`
    width: 100px;
    height: 140px;
    border-radius: 8px;
    background: white;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s;
    border: ${props => {
        if (props.selected) return '3px solid #f1c40f';
        if (props.isPlayer1 && !props.disabled) return '20px solid #e74c3c';
        return '1px solid #bdc3c7';
    }};
    box-shadow: ${props => props.selected ? '0 0 10px #f1c40f' : '0 2px 4px rgba(0,0,0,0.2)'};
    opacity: ${props => props.disabled ? 0.7 : 1};

    &:hover {
        transform: ${props => !props.disabled && 'translateY(-5px)'};
    }
`;

const Number = styled.div<{ color: string }>`
    font-size: 4.5em;
    font-weight: bold;
    color: ${props => props.color};
    font-family: 'Palatino', 'Garamond', serif;
`;

export const Card: React.FC<CardProps> = ({ card, onClick, disabled, selected, isPlayer1 }) => {
    if (!card.faceUp) {
        return (
            <CardContainer 
                onClick={disabled ? undefined : onClick}
                disabled={disabled}
                selected={selected}
                isPlayer1={isPlayer1}
                style={{ background: '#34495e' }}
            />
        );
    }

    const color = card.suit === 'hearts' ? '#e74c3c' : '#2c3e50';

    return (
        <CardContainer 
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            selected={selected}
            isPlayer1={isPlayer1}
        >
            <Number color={color}>{card.rank}</Number>
        </CardContainer>
    );
}; 