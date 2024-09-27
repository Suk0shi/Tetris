import Board from "./components/Board";
import HoldingBlock from "./components/HoldingBlock";
import UpcomingBlocks from './components/UpcomingBlocks';
import { useTetris } from "./hooks/useTetris";
import tetris from "./assets/tetris.png"
import Controls from "./components/Controls";



function App() {
  const {board, startGame, isPlaying, score, upcomingBlocks, holdingBlock,
     setHardDropKey, hardDropKey, softDropKey, setSoftDropKey, leftKey,
     setLeftKey, rightKey, setRightKey, rotateAntiClockwiseKey, 
     setRotateAnticlockwiseKey, rotateClockwiseKey, setRotateClockwiseKey
    } = useTetris();


  return (
    <div className="App">
      <img src={tetris} alt="Tetris" />
      {isPlaying ? (
          <div className="holdingBox">
            <h2>Hold</h2>
            <HoldingBlock holdingBlock={holdingBlock}/>
          </div>
        ) : null}
      
      <div className="boardContainer">
        <Board currentBoard={board}/>
      </div>
      <div className="controls">
      <h2>Score: {score}</h2>
        {isPlaying ? (
          <UpcomingBlocks upcomingBlocks={upcomingBlocks}/>
          ) : (
          <button className="newGameButton" onClick={startGame}><h2>New Game</h2></button>
        )}
      </div>
      <div className="controlSettings">
            <h1>Controls</h1>
            <p>HardDrop <button onClick={() => Controls(setHardDropKey)}>{hardDropKey}</button></p>
            <p>SoftDrop <button onClick={() => Controls(setSoftDropKey)}>{softDropKey}</button></p>
            <p>Left <button onClick={() => Controls(setLeftKey)}>{leftKey}</button></p>
            <p>Right <button onClick={() => Controls(setRightKey)}>{rightKey}</button></p>
            <p>Rotate Anticlockwise <button onClick={() => Controls(setRotateAnticlockwiseKey)}>{rotateAntiClockwiseKey}</button></p>
            <p>Rotate Clockwise <button onClick={() => Controls(setRotateClockwiseKey)}>{rotateClockwiseKey}</button></p>
        </div>
    </div>
  )
}

export default App
