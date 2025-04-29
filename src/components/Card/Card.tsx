import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Card as CardType } from '../../models/Card';

interface CardProps {
    card: CardType;
    onClick?: () => void;
    disabled?: boolean;
}

const CardContainer = styled(motion.div)<{ isRed: boolean }>`
    width: 100px;
    height: 140px;
    background: ${props => props.isRed ? '#ffebee' : '#fff'};
    border: 2px solid #ccc;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    user-select: none;
    position: relative;
    font-family: 'Arial', sans-serif;
    
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
`;

const CardContent = styled.div`
    font-size: 2em;
    font-weight: bold;
`;

const CardSuit = styled.div<{ isRed: boolean }>`
    color: ${props => props.isRed ? '#e53935' : '#212121'};
    font-size: 2.5em;
    line-height: 1;
`;

const getSuitSymbol = (suit: CardType['suit']): string => {
    switch (suit) {
        case 'hearts': return '♥';
        case 'diamonds': return '♦';
        case 'clubs': return '♣';
        case 'spades': return '♠';
    }
};

export const Card: React.FC<CardProps> = ({ card, onClick, disabled }) => {
    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    
    return (
        <CardContainer
            isRed={isRed}
            onClick={disabled ? undefined : onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            {card.faceUp ? (
                <>
                    <CardContent>{card.rank}</CardContent>
                    <CardSuit isRed={isRed}>{getSuitSymbol(card.suit)}</CardSuit>
                </>
            ) : (
                <CardContent>🎴</CardContent>
            )}
        </CardContainer>
    );
}; 