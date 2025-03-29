"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Eye } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { GameState } from "@/app/page"

type Cell = {
  x: number
  y: number
  walls: {
    top: boolean
    right: boolean
    bottom: boolean
    left: boolean
  }
  visited: boolean
}

type Position = {
  x: number
  y: number
}

type MazeGameProps = {
  size: number
  visibilityTime: number
  onLevelComplete: () => void
  onAttempt: () => void
  level: number
  gameState: GameState
  setGameState: (state: GameState) => void
}

export function MazeGame({
  size,
  visibilityTime,
  onLevelComplete,
  onAttempt,
  level,
  gameState,
  setGameState,
}: MazeGameProps) {
  const [maze, setMaze] = useState<Cell[][]>([])
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 0, y: 0 })
  const [endPosition, setEndPosition] = useState<Position>({ x: 0, y: 0 })
  const [showMaze, setShowMaze] = useState(true)
  const [timeLeft, setTimeLeft] = useState(visibilityTime)
  const [touchStart, setTouchStart] = useState<Position | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [hintTimeLeft, setHintTimeLeft] = useState(1)
  const [hintUsed, setHintUsed] = useState(false)
  const mazeRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()

  // Generate maze
  const generateMaze = useCallback(() => {
    // Initialize grid with walls
    const grid: Cell[][] = []
    for (let y = 0; y < size; y++) {
      const row: Cell[] = []
      for (let x = 0; x < size; x++) {
        row.push({
          x,
          y,
          walls: { top: true, right: true, bottom: true, left: true },
          visited: false,
        })
      }
      grid.push(row)
    }

    // Depth-first search maze generation
    const stack: Cell[] = []
    const startCell = grid[0][0]
    startCell.visited = true
    stack.push(startCell)

    while (stack.length > 0) {
      const current = stack[stack.length - 1]
      const { x, y } = current

      // Find unvisited neighbors
      const neighbors: { cell: Cell; direction: string }[] = []

      if (y > 0 && !grid[y - 1][x].visited) {
        neighbors.push({ cell: grid[y - 1][x], direction: "top" })
      }
      if (x < size - 1 && !grid[y][x + 1].visited) {
        neighbors.push({ cell: grid[y][x + 1], direction: "right" })
      }
      if (y < size - 1 && !grid[y + 1][x].visited) {
        neighbors.push({ cell: grid[y + 1][x], direction: "bottom" })
      }
      if (x > 0 && !grid[y][x - 1].visited) {
        neighbors.push({ cell: grid[y][x - 1], direction: "left" })
      }

      if (neighbors.length === 0) {
        stack.pop()
      } else {
        const { cell: next, direction } = neighbors[Math.floor(Math.random() * neighbors.length)]

        // Remove walls between current and next
        if (direction === "top") {
          current.walls.top = false
          next.walls.bottom = false
        } else if (direction === "right") {
          current.walls.right = false
          next.walls.left = false
        } else if (direction === "bottom") {
          current.walls.bottom = false
          next.walls.top = false
        } else if (direction === "left") {
          current.walls.left = false
          next.walls.right = false
        }

        next.visited = true
        stack.push(next)
      }
    }

    // Reset visited property for gameplay
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        grid[y][x].visited = false
      }
    }

    // Set start and end positions
    setPlayerPosition({ x: 0, y: 0 })
    setEndPosition({ x: size - 1, y: size - 1 })

    return grid
  }, [size])

  // Initialize game
  useEffect(() => {
    if (gameState === "preparing") {
      const newMaze = generateMaze()
      setMaze(newMaze)
      setPlayerPosition({ x: 0, y: 0 })
      setEndPosition({ x: size - 1, y: size - 1 })
      setShowMaze(true)
      setTimeLeft(visibilityTime)
      setHintUsed(false)

      // Start memorizing after a short delay
      const timer = setTimeout(() => {
        setGameState("memorizing")
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [gameState, generateMaze, size, visibilityTime, setGameState])

  // Handle memorizing timer
  useEffect(() => {
    if (gameState === "memorizing") {
      if (timeLeft <= 0) {
        setShowMaze(false)
        setGameState("playing")
        return
      }

      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 0.1)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [timeLeft, gameState, setGameState])

  // Handle hint timer
  useEffect(() => {
    if (showHint) {
      if (hintTimeLeft <= 0) {
        setShowHint(false)
        return
      }

      const timer = setTimeout(() => {
        setHintTimeLeft((prev) => prev - 0.1)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [hintTimeLeft, showHint])

  // Handle keyboard movement
  useEffect(() => {
    if (gameState !== "playing") return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return

      const { x, y } = playerPosition
      let newX = x
      let newY = y
      let canMove = false

      switch (e.key) {
        case "ArrowUp":
          if (!maze[y][x].walls.top) {
            newY = y - 1
            canMove = true
          }
          break
        case "ArrowRight":
          if (!maze[y][x].walls.right) {
            newX = x + 1
            canMove = true
          }
          break
        case "ArrowDown":
          if (!maze[y][x].walls.bottom) {
            newY = y + 1
            canMove = true
          }
          break
        case "ArrowLeft":
          if (!maze[y][x].walls.left) {
            newX = x - 1
            canMove = true
          }
          break
      }

      if (canMove) {
        setPlayerPosition({ x: newX, y: newY })

        // Check if player reached the end
        if (newX === endPosition.x && newY === endPosition.y) {
          setGameState("completed")
          setTimeout(() => {
            onLevelComplete()
          }, 500)
        }
      } else {
        // Hit a wall
        onAttempt()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [playerPosition, maze, gameState, endPosition, onLevelComplete, onAttempt, setGameState])

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (gameState !== "playing") return
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (gameState !== "playing" || !touchStart) return

    const touch = e.changedTouches[0]
    const endX = touch.clientX
    const endY = touch.clientY

    const deltaX = endX - touchStart.x
    const deltaY = endY - touchStart.y

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 50) {
        movePlayer("right")
      } else if (deltaX < -50) {
        movePlayer("left")
      }
    } else {
      // Vertical swipe
      if (deltaY > 50) {
        movePlayer("down")
      } else if (deltaY < -50) {
        movePlayer("up")
      }
    }

    setTouchStart(null)
  }

  const movePlayer = (direction: "up" | "right" | "down" | "left") => {
    const { x, y } = playerPosition
    let newX = x
    let newY = y
    let canMove = false

    switch (direction) {
      case "up":
        if (!maze[y][x].walls.top) {
          newY = y - 1
          canMove = true
        }
        break
      case "right":
        if (!maze[y][x].walls.right) {
          newX = x + 1
          canMove = true
        }
        break
      case "down":
        if (!maze[y][x].walls.bottom) {
          newY = y + 1
          canMove = true
        }
        break
      case "left":
        if (!maze[y][x].walls.left) {
          newX = x - 1
          canMove = true
        }
        break
    }

    if (canMove) {
      setPlayerPosition({ x: newX, y: newY })

      // Check if player reached the end
      if (newX === endPosition.x && newY === endPosition.y) {
        setGameState("completed")
        setTimeout(() => {
          onLevelComplete()
        }, 500)
      }
    } else {
      // Hit a wall
      onAttempt()
    }
  }

  const useHint = () => {
    if (!hintUsed) {
      setShowHint(true)
      setHintTimeLeft(1)
      setHintUsed(true)
    }
  }

  // Calculate cell size based on container width
  const getCellSize = () => {
    if (!mazeRef.current) return 30
    const containerWidth = mazeRef.current.clientWidth
    return Math.floor((containerWidth - 2) / size)
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {gameState === "memorizing" && (
        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-purple-500 h-full transition-all duration-100 ease-linear"
            style={{ width: `${(timeLeft / visibilityTime) * 100}%` }}
          ></div>
        </div>
      )}

      <div
        ref={mazeRef}
        className="relative border-2 border-white-500/30 rounded-md overflow-hidden bg-slate-900/80 backdrop-blur-sm shadow-xl transition-all duration-300"
        style={{
          width: "100%",
          aspectRatio: "1/1",
          touchAction: "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {(showMaze || showHint) && maze.length > 0 && (
          <div
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${size}, 1fr)`,
              gridTemplateRows: `repeat(${size}, 1fr)`,
            }}
          >
            {maze.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className="relative transition-all duration-300"
                  style={{
                    borderTopWidth: cell.walls.top ? "2px" : "0",
                    borderRightWidth: cell.walls.right ? "2px" : "0",
                    borderBottomWidth: cell.walls.bottom ? "2px" : "0",
                    borderLeftWidth: cell.walls.left ? "2px" : "0",
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  {x === 0 && y === 0 && <div className="absolute inset-0 bg-green-500 opacity-40 rounded-sm"></div>}
                  {x === endPosition.x && y === endPosition.y && (
                    <div className="absolute inset-0 bg-red-500 opacity-40 rounded-sm"></div>
                  )}
                </div>
              )),
            )}
          </div>
        )}

        {gameState === "playing" || gameState === "completed" || gameState === "waiting" ? (
          <div
            className="absolute grid"
            style={{
              gridTemplateColumns: `repeat(${size}, 1fr)`,
              gridTemplateRows: `repeat(${size}, 1fr)`,
              inset: 0,
            }}
          >
            {/* Start position */}
            <div
              className="absolute bg-green-500 rounded-full shadow-lg shadow-green-500/30 animate-pulse"
              style={{
                width: `${getCellSize() * 0.6}px`,
                height: `${getCellSize() * 0.6}px`,
                left: `${getCellSize() * 0.2}px`,
                top: `${getCellSize() * 0.2}px`,
              }}
            ></div>

            {/* End position */}
            <div
              className="absolute bg-red-500 rounded-full shadow-lg shadow-red-500/30 animate-pulse"
              style={{
                width: `${getCellSize() * 0.6}px`,
                height: `${getCellSize() * 0.6}px`,
                left: `${endPosition.x * getCellSize() + getCellSize() * 0.2}px`,
                top: `${endPosition.y * getCellSize() + getCellSize() * 0.2}px`,
              }}
            ></div>

            {/* Player */}
            <div
              className={`absolute bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 transition-all duration-200 ${
                gameState === "completed" ? "animate-ping" : ""
              }`}
              style={{
                width: `${getCellSize() * 0.7}px`,
                height: `${getCellSize() * 0.7}px`,
                left: `${playerPosition.x * getCellSize() + getCellSize() * 0.15}px`,
                top: `${playerPosition.y * getCellSize() + getCellSize() * 0.15}px`,
              }}
            ></div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {gameState === "preparing" && (
              <p className="text-2xl font-bold text-white bg-slate-900/70 px-6 py-3 rounded-lg shadow-lg">
                Level {level}
              </p>
            )}
            {gameState === "memorizing" && (
              <p className="text-2xl font-bold text-white bg-slate-900/70 px-6 py-3 rounded-lg shadow-lg animate-pulse opacity-10">
                Memorize the maze!
              </p>
            )}
            {gameState === "gameover" && (
              <p className="text-2xl font-bold text-white bg-slate-900/70 px-6 py-3 rounded-lg shadow-lg text-red-400">
                Game Over!
              </p>
            )}
          </div>
        )}
      </div>

      {gameState === "playing" && (
        <>
          {isMobile ? (
            <div className="w-full flex justify-center items-center mt-4">
              <div className="grid grid-cols-3 gap-2 max-w-[240px]">
                <div></div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => movePlayer("up")}
                  className="bg-slate-800/80 border-white-500/30 text-white hover:bg-purple-900/30 transition-colors duration-300 shadow-md"
                >
                  <ArrowUp />
                </Button>
                <div></div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => movePlayer("left")}
                  className="bg-slate-800/80 border-white-500/30 text-white hover:bg-purple-900/30 transition-colors duration-300 shadow-md"
                >
                  <ArrowLeft />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  disabled={hintUsed}
                  onClick={useHint}
                  className={`bg-slate-800/80 border-white-500/30 text-white transition-colors duration-300 shadow-md ${
                    hintUsed ? "opacity-50" : "hover:bg-purple-900/30"
                  }`}
                >
                  <Eye />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => movePlayer("right")}
                  className="bg-slate-800/80 border-white-500/30 text-white hover:bg-purple-900/30 transition-colors duration-300 shadow-md"
                >
                  <ArrowRight />
                </Button>

                <div></div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => movePlayer("down")}
                  className="bg-slate-800/80 border-white-500/30 text-white hover:bg-purple-900/30 transition-colors duration-300 shadow-md"
                >
                  <ArrowDown />
                </Button>
                <div></div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                disabled={hintUsed}
                onClick={useHint}
                className={`flex items-center gap-2 bg-slate-800/80 border-white-500/30 text-white shadow-md ${
                  hintUsed ? "opacity-50" : "hover:bg-purple-900/30 transition-colors duration-300"
                }`}
              >
                <Eye size={16} />
                Use Hint
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-purple-300 mt-2">
            {isMobile ? (
              <p>Use the buttons to navigate or swipe on the maze</p>
            ) : (
              <p>Use arrow keys to navigate the maze</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

