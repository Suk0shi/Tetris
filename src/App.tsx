import Board from "./components/Board";
import HoldingBlock from "./components/HoldingBlock";
import UpcomingBlocks from './components/UpcomingBlocks';
import { useTetris } from "./hooks/useTetris";



function App() {
  const {board, startGame, isPlaying, score, upcomingBlocks, holdingBlock} = useTetris();


  return (
    <div className="App">
      <h1>Tetris</h1>
      {isPlaying ? (
          <div className="holdingBox">
            <h2>Hold</h2>
            <HoldingBlock holdingBlock={holdingBlock}/>
          </div>
        ) : null}
      
      <Board currentBoard={board}/>
      <div className="controls">
      <h2>Score: {score}</h2>
        {isPlaying ? (
          <UpcomingBlocks upcomingBlocks={upcomingBlocks}/>
          ) : (
          <button onClick={startGame}>New Game</button>
        )}
      </div>
    </div>
  )
}

export default App
