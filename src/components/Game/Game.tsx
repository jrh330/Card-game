import React, { useState } from 'react';
import styled from '@emotion/styled';
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

const PlayArea = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    width: 100%;
    padding: 1rem;
`;

export const Game: React.FC = () => {
    const [gameId, setGameId] = useState<string | null>(null);

    if (!gameId) {
        return <GameLobby onGameStart={setGameId} />;
    }

    // Placeholder for when gameId is set
    return (
        <GameContainer>
            <Table>
                <PlayerArea isBottom>
                    {/* Player's hand, etc. */}
                </PlayerArea>
                <PlayArea>
                    {/* Played cards, actions, etc. */}
                </PlayArea>
                <PlayerArea>
                    {/* Opponent's hand, etc. */}
                </PlayerArea>
            </Table>
        </GameContainer>
    );
};