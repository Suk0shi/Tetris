import Board from "./components/Board";
import HoldingBlock from "./components/HoldingBlock";
import UpcomingBlocks from './components/UpcomingBlocks';
import { useTetris } from "./hooks/useTetris";
import tetris from "./assets/tetris.png"



function App() {
  const {board, startGame, isPlaying, score, upcomingBlocks, holdingBlock} = useTetris();


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
    </div>
  )
}

export default App
