"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Slider } from "@/components/ui/slider"
import { MazeGame } from "@/components/maze-game"
import { Info, Trophy, Settings, RefreshCw, Lock, CheckCircle, AlertTriangle } from "lucide-react"

export type GameState = "preparing" | "memorizing" | "playing" | "completed" | "waiting" | "gameover"

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false)
  const [showLevelSelect, setShowLevelSelect] = useState(false)
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [visibilityTime, setVisibilityTime] = useState(5)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showGameOver, setShowGameOver] = useState(false)
  const [gameState, setGameState] = useState<GameState>("preparing")
  const [highestLevelUnlocked, setHighestLevelUnlocked] = useState(1)
  const [completedLevels, setCompletedLevels] = useState<number[]>([])
  const [totalLevels] = useState(12) // Increased to 12 levels
  const [pointsEarned, setPointsEarned] = useState(0)
  const [isFirstAttempt, setIsFirstAttempt] = useState(true)
  const [showCollision, setShowCollision] = useState(false)

  // Load game progress from localStorage
  useEffect(() => {
    const savedLevel = localStorage.getItem("highestLevelUnlocked")
    if (savedLevel) {
      setHighestLevelUnlocked(Number.parseInt(savedLevel))
    }

    const savedScore = localStorage.getItem("score")
    if (savedScore) {
      setScore(Number.parseInt(savedScore))
    }

    const savedCompletedLevels = localStorage.getItem("completedLevels")
    if (savedCompletedLevels) {
      setCompletedLevels(JSON.parse(savedCompletedLevels))
    }
  }, [])

  // Save game progress to localStorage
  useEffect(() => {
    localStorage.setItem("highestLevelUnlocked", highestLevelUnlocked.toString())
  }, [highestLevelUnlocked])

  useEffect(() => {
    localStorage.setItem("score", score.toString())
  }, [score])

  useEffect(() => {
    localStorage.setItem("completedLevels", JSON.stringify(completedLevels))
  }, [completedLevels])

  // Check if this is a first attempt at this level
  useEffect(() => {
    setIsFirstAttempt(!completedLevels.includes(level))
  }, [level, completedLevels])

  // Reset collision effect after 1 second
  useEffect(() => {
    if (showCollision) {
      const timer = setTimeout(() => {
        setShowCollision(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [showCollision])

  const showLevelSelection = () => {
    setShowLevelSelect(true)
  }

  const startGame = (selectedLevel: number) => {
    setGameStarted(true)
    setShowLevelSelect(false)
    setLevel(selectedLevel)
    setAttempts(0)
    setGameState("preparing")
  }

  const handleLevelComplete = useCallback(() => {
    const isFirstTimeCompletion = !completedLevels.includes(level)
    let newPoints = 0

    // Only add to score if this is the first time completing this level
    if (isFirstTimeCompletion) {
      newPoints = Math.max(100 - attempts * 10, 10) * level
      setScore((prevScore) => prevScore + newPoints)
      setCompletedLevels((prev) => [...prev, level])
    }

    setPointsEarned(newPoints)
    setShowSuccess(true)
    setGameState("waiting")

    // Unlock next level if this is the highest level completed
    if (level >= highestLevelUnlocked) {
      setHighestLevelUnlocked(level + 1)
    }
  }, [level, attempts, completedLevels, highestLevelUnlocked])

  const handleContinueToNextLevel = useCallback(() => {
    setShowSuccess(false)
    setGameStarted(false)
    setShowLevelSelect(true)
  }, [])

  const handleAttempt = useCallback(() => {
    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    setShowCollision(true) // Show collision effect

    // Check if attempts exceed the limit
    if (newAttempts >= 10) {
      setGameState("gameover")
      setShowGameOver(true)
    }
  }, [attempts])

  const handlePlayAgain = useCallback(() => {
    setShowGameOver(false)

    // If this was a first attempt at an uncompleted level, reset the game
    if (isFirstAttempt) {
      resetProgress()
      startGame(1)
    } else {
      // Otherwise, just go back to level selection
      setShowLevelSelect(true)
      setGameStarted(false)
    }
  }, [isFirstAttempt])

  const handleExitGame = useCallback(() => {
    setGameStarted(false)
    setShowLevelSelect(false)
  }, [])

  const resetProgress = useCallback(() => {
    setHighestLevelUnlocked(1)
    setCompletedLevels([])
    setScore(0)
    localStorage.removeItem("highestLevelUnlocked")
    localStorage.removeItem("completedLevels")
    localStorage.removeItem("score")
    setShowSettings(false)
  }, [])

  const getMazeSize = useCallback(() => {
    // Start with a small maze and increase size with level
    const baseSize = 5
    const additionalSize = Math.min(Math.floor(level / 2), 6)
    return baseSize + additionalSize
  }, [level])

  const getVisibilityTime = useCallback(() => {
    // Decrease visibility time as levels progress
    return Math.max(visibilityTime - (level - 1) * 0.4, 1.5)
  }, [level, visibilityTime])

  // Generate array of level numbers
  const levelNumbers = Array.from({ length: totalLevels }, (_, i) => i + 1)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white">
      <div className="w-full max-w-md flex flex-col items-center gap-6 animate-fadeIn">
        <h1 className="text-5xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          Memory Maze
        </h1>

        {!gameStarted && !showLevelSelect ? (
          <Card className="w-full p-6 bg-slate-900/80 border-white-500/30 backdrop-blur-sm shadow-xl animate-slideUp">
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-slate-200 mb-4">
                Test your memory by navigating a maze that disappears after a few seconds!
              </p>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg shadow-purple-700/30"
                onClick={showLevelSelection}
              >
                Start Game
              </Button>
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1 border-purple-500/50 text-slate-600 
                  hover:text-white hover:bg-purple-900/30 transition-colors duration-300"
                  onClick={() => setShowInstructions(true)}
                >
                  <Info className="mr-2 h-4 w-4" />
                  How to Play
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-purple-500/50 text-slate-600 
                   hover:text-white hover:bg-purple-900/30 transition-colors duration-300"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>
          </Card>
        ) : showLevelSelect ? (
          <Card className="w-full p-6 bg-slate-900/80 border-white-500/30 backdrop-blur-sm shadow-xl animate-slideUp">
            <div className="flex flex-col items-center gap-4">
              <div className="flex justify-between items-center w-full">
                <h2 className="text-2xl font-bold text-white">Select Level</h2>
                <div className="bg-slate-800/80 backdrop-blur-sm px-3 py-1 rounded-md border border-white-500/20 shadow-lg">
                  <p className="text-sm text-purple-300">Score</p>
                  <p className="text-lg font-bold text-white text-center">{score}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full">
                {levelNumbers.map((levelNum) => (
                  <Button
                    key={levelNum}
                    variant={levelNum <= highestLevelUnlocked ? "default" : "outline"}
                    disabled={levelNum > highestLevelUnlocked}
                    className={`h-16 relative ${
                      levelNum <= highestLevelUnlocked
                        ? levelNum === highestLevelUnlocked && highestLevelUnlocked > 1
                          ? "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 border-2 border-yellow-300"
                          : completedLevels.includes(levelNum)
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        : "bg-slate-800/50 border-white/20 text-slate-400"
                    }`}
                    onClick={() => levelNum <= highestLevelUnlocked && startGame(levelNum)}
                  >
                    <span className="text-lg font-bold">{levelNum}</span>
                    {levelNum <= highestLevelUnlocked ? (
                      completedLevels.includes(levelNum) && (
                        <CheckCircle className="absolute bottom-1 right-1 h-4 w-4 text-white" />
                      )
                    ) : (
                      <Lock className="absolute bottom-1 right-1 h-4 w-4" />
                    )}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                className="mt-4 border-purple-500/50 text-slate-600 hover:text-white hover:bg-purple-900/30 transition-colors duration-300"
                onClick={() => setShowLevelSelect(false)}
              >
                Back to Menu
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="w-full flex justify-between items-center mb-4 animate-fadeIn">
              <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-md border border-white-500/20 shadow-lg">
                <p className="text-sm text-purple-300">Level</p>
                <p className="text-xl font-bold text-white">{level}</p>
              </div>
              <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-md border border-white-500/20 shadow-lg">
                <p className="text-sm text-purple-300">Score</p>
                <p className="text-xl font-bold text-white">{score}</p>
              </div>
              <div
                className={`bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-md border shadow-lg transition-all duration-300 ${
                  showCollision ? "border-red-500 shadow-red-500/30" : "border-white-500/20"
                }`}
              >
                <p className="text-sm text-purple-300">Attempts</p>
                <p
                  className={`text-xl font-bold transition-colors duration-300 ${
                    showCollision ? "text-red-400" : "text-white"
                  }`}
                >
                  {attempts}/10
                </p>
              </div>
            </div>

            <div className="animate-fadeIn w-full">
              <MazeGame
                size={getMazeSize()}
                visibilityTime={getVisibilityTime()}
                onLevelComplete={handleLevelComplete}
                onAttempt={handleAttempt}
                level={level}
                gameState={gameState}
                setGameState={setGameState}
              />
            </div>

            <div className="flex gap-2 w-full mt-4 animate-fadeIn">
              <Button
                variant="outline"
                className="flex-1 border-purple-500/50 text-slate-600 hover:text-white hover:bg-purple-900/30 transition-colors duration-300"
                onClick={handleExitGame}
              >
                Exit Game
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-purple-500/50 text-slate-600 hover:text-white hover:bg-purple-900/30 transition-colors duration-300"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Settings Dialog */}
      <AlertDialog open={showSettings} onOpenChange={setShowSettings}>
        <AlertDialogContent className="bg-slate-900 border-purple-500/30 shadow-xl animate-scaleIn">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Game Settings</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Adjust the game settings to your preference.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <p className="mb-2 text-white">Initial Visibility Time: {visibilityTime} seconds</p>
              <Slider
                value={[visibilityTime]}
                min={2}
                max={10}
                step={0.5}
                onValueChange={(value) => setVisibilityTime(value[0])}
                className="py-2"
              />
            </div>
            <div className="mt-6 pt-4 border-t border-slate-700">
              <p className="text-red-400 mb-2">Reset Game Progress</p>
              <p className="text-sm text-slate-400 mb-4">
                This will reset all your progress, including unlocked levels and score.
              </p>
              <Button variant="destructive" className="w-full" onClick={resetProgress}>
                Reset Progress
              </Button>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
              Save Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Instructions Dialog */}
      <AlertDialog open={showInstructions} onOpenChange={setShowInstructions}>
        <AlertDialogContent className="bg-slate-900 border-purple-500/30 shadow-xl animate-scaleIn">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">How to Play</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="py-2">
            <ol className="list-decimal pl-5 space-y-2 text-slate-200">
              <li>Select a level to play (only unlocked levels are available).</li>
              <li>A maze will appear for a few seconds, then disappear.</li>
              <li>Memorize the path from start (green) to finish (red).</li>
              <li>Use arrow keys or swipe to navigate through the maze.</li>
              <li>Avoid hitting walls - each collision counts as an attempt.</li>
              <li>You have a maximum of 10 attempts per level.</li>
              <li>Complete levels to earn points and unlock new levels.</li>
              <li>Points are only earned the first time you complete a level.</li>
              <li>If you run out of attempts on your first try of a level, all progress will be reset.</li>
              <li>Higher levels have larger mazes and less visibility time.</li>
            </ol>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
              Got it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Level Complete Dialog */}
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent className="bg-slate-900 border-purple-500/30 shadow-xl animate-scaleIn">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-white">
              <Trophy className="mr-2 h-5 w-5 text-yellow-400 animate-pulse" />
              Level Complete!
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="py-2">
            <p className="text-slate-200">You completed level {level}!</p>

            {pointsEarned > 0 ? (
              <p className="mt-2 text-slate-200">
                Points earned: <span className="text-green-400 font-bold">{pointsEarned}</span>
              </p>
            ) : completedLevels.includes(level) ? (
              <p className="mt-2 text-slate-200">No points earned (level already completed)</p>
            ) : null}

            <p className="mt-2 text-slate-200">
              Total score: <span className="text-green-400 font-bold">{score}</span>
            </p>

            {level < totalLevels && level >= highestLevelUnlocked - 1 ? (
              <p className="mt-4 text-purple-300">Level {level + 1} is now unlocked!</p>
            ) : level === totalLevels ? (
              <p className="mt-4 text-purple-300">Congratulations! You've completed all levels!</p>
            ) : null}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              onClick={handleContinueToNextLevel}
            >
              Next Level
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Game Over Dialog */}
      <AlertDialog open={showGameOver} onOpenChange={setShowGameOver}>
        <AlertDialogContent className="bg-slate-900 border-purple-500/30 shadow-xl animate-scaleIn">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-white">
              <RefreshCw className="mr-2 h-5 w-5 text-red-400" />
              Game Over!
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="py-2">
            <p className="text-slate-200">You've reached the maximum number of attempts (10).</p>

            {isFirstAttempt ? (
              <>
                <div className="mt-4 p-3 bg-red-950/50 border border-red-500/30 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-red-200 font-medium">First attempt failure</p>
                      <p className="text-sm text-red-300 mt-1">
                        Since this was your first attempt at level {level}, all progress will be reset.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-slate-300">You'll start again from level 1 with a score of 0.</p>
              </>
            ) : (
              <>
                <p className="mt-2 text-slate-200">
                  Score: <span className="text-green-400 font-bold">{score}</span>
                </p>
                <p className="mt-2 text-slate-200">
                  Level reached: <span className="text-purple-400 font-bold">{level}</span>
                </p>
                <p className="mt-4 text-slate-300">
                  Since you've already completed this level before, your progress is safe.
                </p>
              </>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              onClick={handlePlayAgain}
            >
              {isFirstAttempt ? "Restart Game" : "Back to Level Selection"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

