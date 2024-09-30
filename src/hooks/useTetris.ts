import { useCallback, useEffect, useState } from "react";
import { BOARD_HEIGHT, getRandomBlock, hasCollisions, useTetrisBoard } from "./useTetrisBoard";
import { useInterval } from "./useInterval";
import { Block, BlockShape, BoardShape, EmptyCell, SHAPES } from "../types";
import blockLand from "../assets/Sounds/blockLand.wav"
import lineClear from "../assets/Sounds/lineClear.wav"

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
    const [justLayed, setJustLayed] = useState(false);
    const [rampingTickSpeed, setRampingTickSpeed] = useState<number>(800);
    const [hardDropKey, setHardDropKey] = useState<string>('s');
    const [leftKey, setLeftKey] = useState<string>('a');
    const [rightKey, setRightKey] = useState<string>('d');
    const [rotateClockwiseKey, setRotateClockwiseKey] = useState<string>('l');
    const [rotateAntiClockwiseKey, setRotateAnticlockwiseKey] = useState<string>('j');
    const [softDropKey, setSoftDropKey] = useState<string>('w');
    
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

    //    setJustLayed(true);
    //    isPressingLeft = false;
    //    isPressingRight = false;
    //    clearInterval(moveIntervalID);

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
                new Audio(lineClear).play();
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
       setJustHeld(false);
       if (rampingTickSpeed > 200) {
           setRampingTickSpeed(rampingTickSpeed - 20)
       }
       new Audio(blockLand).play();
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
    
    let moveIntervalID: number | undefined;
    let isPressingLeft = false;
    let isPressingRight = false;
    
    useEffect(() => {
        if (!isPlaying) {
            return;
        }
        

        const updateMovementInterval = () => {
            if (justLayed) {
                clearInterval(moveIntervalID);
                return;
            } else {
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
                }, 100);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.repeat) {
                return;
            }
            if (event.key === softDropKey) {
                setTickSpeed(TickSpeed.Fast);
            }

            if (event.key === rotateClockwiseKey) {
                dispatchBoardState({
                    type: 'move',
                    isRotatingClockwise: true,
                });
            }

            if (event.key === rotateAntiClockwiseKey) {
                dispatchBoardState({
                    type: 'move',
                    isRotatingAnticlockwise: true,
                });
            }

            if (event.key === leftKey) {
                isPressingLeft = true;
                updateMovementInterval();
            }

            if (event.key === rightKey) {
                isPressingRight = true;
                updateMovementInterval();
            }

            if (event.key === 'Shift' && !justHeld) {
                setJustHeld(true);
                setHoldingBlock(droppingBlock)
                swapHolding()
            }

            if (event.key === hardDropKey) {
                setTickSpeed(TickSpeed.HardDrop);
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === softDropKey) {
                setTickSpeed(rampingTickSpeed);
            }

            if (event.key === leftKey) {
                isPressingLeft = false;
                updateMovementInterval();
            }  
            
            if (event.key === rightKey) {
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

    }, [isPlaying, droppingBlock, justHeld, board, dispatchBoardState, justLayed]);

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
        hardDropKey,
        setHardDropKey,
        softDropKey,
        setSoftDropKey,
        leftKey,
        setLeftKey,
        rightKey,
        setRightKey,
        rotateAntiClockwiseKey,
        setRotateAnticlockwiseKey,
        rotateClockwiseKey,
        setRotateClockwiseKey
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