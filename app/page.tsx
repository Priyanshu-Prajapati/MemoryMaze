"use client"

import { useState, useCallback } from "react"
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
import { Info, Trophy, Settings } from "lucide-react"


// Add this right after imports
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
  .animate-slideUp {
    animation: slideUp 0.5s ease-out forwards;
  }
  .animate-scaleIn {
    animation: scaleIn 0.3s ease-out forwards;
  }
`

export type GameState = "preparing" | "memorizing" | "playing" | "completed" | "waiting"

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false)
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [visibilityTime, setVisibilityTime] = useState(5)
  const [showSuccess, setShowSuccess] = useState(false)
  const [gameState, setGameState] = useState<GameState>("preparing")

  const startGame = () => {
    setGameStarted(true)
    setScore(0)
    setAttempts(0)
    setLevel(1)
    setGameState("preparing")
  }

  const handleLevelComplete = useCallback(() => {
    setScore((prevScore) => prevScore + Math.max(100 - attempts * 10, 10) * level)
    setShowSuccess(true)
    setGameState("waiting")
  }, [level, attempts])

  const handleContinueToNextLevel = useCallback(() => {
    setLevel((prevLevel) => prevLevel + 1)
    setAttempts(0)
    setShowSuccess(false)
    setGameState("preparing")
  }, [])

  const handleAttempt = useCallback(() => {
    setAttempts((prev) => prev + 1)
  }, [])

  const getMazeSize = useCallback(() => {
    // Start with a small maze and increase size with level
    const baseSize = 5
    const additionalSize = Math.min(Math.floor(level / 2), 5)
    return baseSize + additionalSize
  }, [level])

  const getVisibilityTime = useCallback(() => {
    // Decrease visibility time as levels progress
    return Math.max(visibilityTime - (level - 1) * 0.5, 1.5)
  }, [level, visibilityTime])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white">
      <div className="w-full max-w-md flex flex-col items-center gap-6 animate-fadeIn">
        <h1 className="text-5xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          Memory Maze
        </h1>

        {!gameStarted ? (
          <Card className="w-full p-6 bg-slate-900/80 border-white-500/30 backdrop-blur-sm shadow-xl animate-slideUp">
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-slate-200 mb-4">
                Test your memory by navigating a maze that disappears after a few seconds!
              </p>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg shadow-purple-700/30"
                onClick={startGame}
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
              <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-md border border-white-500/20 shadow-lg">
                <p className="text-sm text-purple-300">Attempts</p>
                <p className="text-xl font-bold text-white">{attempts}</p>
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
                className="flex-1 border-purple-500/50 text-slate-600 hover:bg-purple-900/30 transition-colors duration-300"
                onClick={() => setGameStarted(false)}
              >
                Exit Game
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-purple-500/50 text-slate-600 hover:bg-purple-900/30 transition-colors duration-300"
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
              <li>A maze will appear for a few seconds, then disappear.</li>
              <li>Memorize the path from start (green) to finish (red).</li>
              <li>Use arrow keys or swipe to navigate through the maze.</li>
              <li>Avoid hitting walls - each collision counts as an attempt.</li>
              <li>Complete levels to earn points and face harder challenges.</li>
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
            <p className="mt-2 text-slate-200">
              Points earned:{" "}
              <span className="text-green-400 font-bold">{Math.max(100 - attempts * 10, 10) * level}</span>
            </p>
            <p className="mt-2 text-slate-200">
              Total score: <span className="text-green-400 font-bold">{score}</span>
            </p>
            <p className="mt-4 text-purple-300">Get ready for level {level + 1}...</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              onClick={handleContinueToNextLevel}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

