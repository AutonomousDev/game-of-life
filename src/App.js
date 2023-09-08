import logo from './logo.svg';
import React, { useCallback, useState, useRef, useEffect } from "react";
import produce from 'immer';

import Container from 'react-bootstrap/Container';
// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Global config variables
const numRows = 50;
const numCols = 50;

// Bigger numbers are slowers
const gameSpeedConstant = 1000;
//
function Example() {
  
}


// Operations are used to check every neighbor cell going clockwise
const operations = [
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1]
]

const generateEmptyGrid = () => {
  // Create an array with each place containing another array for rows and columns
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0));
  }
  return rows;
}

function App() {
  // Variable to change game speed mid game
  const [gameSpeed, setGameSpeed] = useState(50);
  const gameSpeedRef = useRef(gameSpeed);
  gameSpeedRef.current = gameSpeed;

  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid();
  });

  // Print the grid to the console for debuging. Looks better in Chrome than Firefox
  console.log(grid);

  // runningRef makes the current running state availbe to other functions
  const [running, setRunning] = useState(false);
  const runningRef = useRef(running);
  runningRef.current = running;

  // Checks the current running state before running the simulation
  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }

    setGrid(g => {
      // Updates the grid using a double for loop to check every column in every row.
      return produce(g, gridCopy => {          // g is our current grid. gridCopy is a draft of changes to be made
        for (let i = 0; i < numRows; i++) {    // Iterate through all rows
          for (let k = 0; k < numCols; k++) {  // Iterate through all columns
            let neighbors = 0;
            operations.forEach(([x, y]) => {  // Count the number of neighbors
              const newI = i + x;
              const newK = k + y;

              // Checks neighbors population
              if (newI >= 0 && newI < numRows && newK >= 0 && newK < numCols) {
                // Since live cells are 1 and dead cells are 0 += adds to the
                neighbors += g[newI][newK]
              }
            })
            if (neighbors < 2 || neighbors > 3) {
              // Cell Death  
              gridCopy[i][k] = 0;
            } else if (g[i][k] === 0 && neighbors === 3) {
              // Cell Birth
              gridCopy[i][k] = 1;
            }
          }
        }
      })
    })

    // Linked to the game speed slider to dynamically change the speed mid game
    setTimeout(runSimulation, (gameSpeedConstant/gameSpeedRef.current)) 
  }, [])

  return (
    <Container>
      {/** If not running button says start, else it says stop */}
      <div class="row align-items-start">
        <div class="mt-2 mb-2 col-3">
          <button
            class="btn btn-success m-1"
            onClick={() => {
              setRunning(!running);
              if (!running) {
                runningRef.current = true;
                runSimulation();
              }
            }}
          >
            {running ? 'Stop' : 'Start'}
          </button>
          <button
            class="btn btn-outline-danger m-1"
            onClick={() => {
              setGrid(generateEmptyGrid());
            }}
          >
            Clear
          </button>
          <button
            class="btn btn-outline-warning m-1"
            onClick={() => {
              const rows = [];
              for (let i = 0; i < numRows; i++) {
                // Randomly generates a state using a value. Random values greater than 0.5 are 1 
                rows.push(Array.from(Array(numCols), () => Math.random() > .5 ? 1 : 0));
              }
              setGrid(rows);
            }}
          >
            Random
          </button>

        </div>
        <div class="slidecontainer col-3">
          <label for="customRange1" class="form-label">Speed: {gameSpeed}</label>
          <input type="range" step="1" min="1" max="100" class="form-range" id="customRange1" onChange={e => setGameSpeed(e.target.value)}/>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${numCols}, 20px)`
      }}>
        {grid.map((rows, i) =>
          rows.map((col, k) => (
            <div // Individual cell
              key={`${i}-${k}`}
              // on click command toggles current cell state to alive or dead
              onClick={() => {
                const newGrid = produce(grid, gridCopy => {
                  gridCopy[i][k] = grid[i][k] ? 0 : 1;
                })
                setGrid(newGrid)
              }}
              style={{
                width: 20,
                height: 20,
                backgroundColor: grid[i][k] ? 'SeaGreen' : undefined,
                border: "solid 1px black"
              }}
            />
          ))
        )}

      </div>
    </Container>
  );
}

export default App;
