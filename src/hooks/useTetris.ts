import { useCallback, useEffect, useState } from "react";
import { BOARD_HEIGHT, getRandomBlock, hasCollisions, useTetrisBoard } from "./useTetrisBoard";
import { useInterval } from "./useInterval";
import { Block, BlockShape, BoardShape, EmptyCell, SHAPES } from "../types";

enum TickSpeed {
    Normal = 800,
    Sliding = 100,
    Fast = 50,
    HardDrop = 0,
}

export function useTetris() {
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [tickSpeed, setTickSpeed] = useState<TickSpeed | null | number>(null);
    const [isCommitting, setIsCommitting] = useState(false);
    const [upcomingBlocks, setUpcomingBlocks] = useState<Block[]>([]);
    const [holdingBlock, setHoldingBlock] = useState<Block | null>(null);
    const [justHeld, setJustHeld] = useState(false);
    const [rampingTickSpeed, setRampingTickSpeed] = useState<number>(800);
    
    const [
        { board, droppingRow, droppingColumn, droppingBlock, droppingShape },
        dispatchBoardState,
    ] = useTetrisBoard();

    const startGame = useCallback(() => {
        const startingBlocks = [
            getRandomBlock(),
            getRandomBlock(),
            getRandomBlock(),
        ];
        setUpcomingBlocks(startingBlocks);
        setHoldingBlock(null);
        setScore(0);
        setIsPlaying(true);
        setRampingTickSpeed(800);
        setTickSpeed(rampingTickSpeed);
        dispatchBoardState({ type: 'start' })
    }, [dispatchBoardState, setRampingTickSpeed])

    const commitPosition = useCallback(() => {
       if (!hasCollisions(board, droppingShape, droppingRow + 1, droppingColumn)) {
        setIsCommitting(false);
        setTickSpeed(rampingTickSpeed)
        return;
       } 

       const newBoard = structuredClone(board) as BoardShape;
       addShapeToBoard(
        newBoard,
        droppingBlock, 
        droppingShape,
        droppingRow,
        droppingColumn
       );

       let numCleared = 0;
        for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
            if (newBoard[row].every((entry) => entry !== EmptyCell.Empty)) {
                numCleared++;
                newBoard.splice(row, 1);
            }
       }

       const newUpcomingBlocks = structuredClone(upcomingBlocks) as Block[];
       const newBlock = newUpcomingBlocks.pop() as Block;
       newUpcomingBlocks.unshift(getRandomBlock());

       if (hasCollisions(board, SHAPES[newBlock].shape, 0, 3)) {
        setIsPlaying(false);
        setTickSpeed(null);
       } else {
        setTickSpeed(rampingTickSpeed);
       }

       setScore((prevScore) => prevScore + getPoints(numCleared));
       setTickSpeed(rampingTickSpeed);
       setUpcomingBlocks(newUpcomingBlocks);
       dispatchBoardState({ type: 'commit', newBoard, newBlock });
       setIsCommitting(false);
       setJustHeld(false)
       if (rampingTickSpeed > 100) {
           setRampingTickSpeed(rampingTickSpeed - 30)
       }
    }, [board, dispatchBoardState, droppingBlock, droppingColumn, droppingRow, droppingShape, justHeld]);

    const swapHolding = useCallback(() => {
        
        
 
        const newBoard = structuredClone(board) as BoardShape;
        // addShapeToBoard(
        //  newBoard,
        //  droppingBlock, 
        //  droppingShape,
        //  droppingRow,
        //  droppingColumn
        // );

        let newBlock = null;
        const newUpcomingBlocks = structuredClone(upcomingBlocks) as Block[];
 
        if (holdingBlock !== null) {
            newBlock = holdingBlock; 
        } else {
            newBlock = newUpcomingBlocks.pop() as Block;
            newUpcomingBlocks.unshift(getRandomBlock());
        }
 
        if (hasCollisions(board, SHAPES[newBlock].shape, 0, 3)) {
         setIsPlaying(false);
         setTickSpeed(null);
        } else {
         setTickSpeed(rampingTickSpeed);
        }
 
        setTickSpeed(rampingTickSpeed);
        if (holdingBlock === null) {
            setUpcomingBlocks(newUpcomingBlocks);
        }
        dispatchBoardState({ type: 'commit', newBoard, newBlock });
        setIsCommitting(false);
     }, [board, dispatchBoardState, droppingBlock, droppingColumn, droppingRow, droppingShape, holdingBlock, justHeld]);

    const gameTick = useCallback(() => {
        if (isCommitting) {
            commitPosition();
        } else if (
            hasCollisions(board, droppingShape, droppingRow +1, droppingColumn)
        ) {
            setTickSpeed(TickSpeed.Sliding);
            setIsCommitting(true);
        } else {
            dispatchBoardState({ type: 'drop' })
        }
    }, [board,
        commitPosition,
        dispatchBoardState,
        droppingColumn,
        droppingRow,
        droppingShape,
        isCommitting,
    ]);

    useEffect(() => {
        if (!isPlaying) {
            return;
        }

        let isPressingLeft = false;
        let isPressingRight = false;
        let moveIntervalID: number | undefined;

        const updateMovementInterval = () => {
            clearInterval(moveIntervalID);
            dispatchBoardState({
                type: 'move',
                isPressingLeft,
                isPressingRight,
            });
            moveIntervalID = setInterval(() => {
                dispatchBoardState({
                    type: 'move',
                    isPressingLeft,
                    isPressingRight,
                });
            }, 300);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.repeat) {
                return;
            }
            if (event.key === 'w') {
                setTickSpeed(TickSpeed.Fast);
            }

            if (event.key === 'l') {
                dispatchBoardState({
                    type: 'move',
                    isRotatingClockwise: true,
                });
            }

            if (event.key === 'j') {
                dispatchBoardState({
                    type: 'move',
                    isRotatingAnticlockwise: true,
                });
            }

            if (event.key === 'a') {
                isPressingLeft = true;
                updateMovementInterval();
            }

            if (event.key === 'd') {
                isPressingRight = true;
                updateMovementInterval();
            }

            if (event.key === 'Shift' && !justHeld) {
                setJustHeld(true);
                setHoldingBlock(droppingBlock)
                swapHolding()
            }

            if (event.key === 's') {
                setTickSpeed(TickSpeed.HardDrop);
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === 'w') {
                setTickSpeed(rampingTickSpeed);
            }

            if (event.key === 'a') {
                isPressingLeft = false;
                updateMovementInterval();
            }  
            
            if (event.key === 'd') {
                isPressingRight = false;
                updateMovementInterval();
            }
            
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            setTickSpeed(rampingTickSpeed);
        };

    }, [isPlaying, droppingBlock, justHeld, board, dispatchBoardState]);

    useInterval(() => {
        if (!isPlaying) {
            return;
        }
        gameTick();
    }, tickSpeed);

    const renderedBoard = structuredClone(board) as BoardShape;
    if (isPlaying) {
        addShapeToBoard(
            renderedBoard,
            droppingBlock,
            droppingShape,
            droppingRow,
            droppingColumn
        );
    }

    
    return {
        board: renderedBoard,
        startGame,
        isPlaying,
        score,
        upcomingBlocks,
        holdingBlock,
    };
}

function addShapeToBoard(
    board: BoardShape,
    droppingBlock: Block,
    droppingShape: BlockShape,
    droppingRow: number, 
    droppingColumn: number
) {
    droppingShape 
        .filter((row) => row.some((isSet) => isSet))
        .forEach((row: boolean[], rowIndex: number) => {
            row.forEach((isSet: boolean, colIndex: number) => {
                if (isSet) {
                    board[droppingRow + rowIndex][droppingColumn + colIndex] =
                    droppingBlock;
                }
            });
        });
}

function getPoints(numCleared: number): number {
    switch (numCleared) {
        case 0:
            return 0;
        case 1:
            return 100;
        case 2:
            return 300;
        case 3:
            return 500;
        case 4:
            return 800;
        default:
            throw Error(`Unexprected number of rows cleared`);
    }
}