import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Memory Maze',
  description: 'Memory Maze is a challenging puzzle game that puts your memory and navigation skills to the test.',
  keywords: 'Memory maze game, Memory game, Maze game, Game, Maze, Brain training, Mind puzzle, memory-based puzzle'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
