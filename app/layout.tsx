import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Memory Maze',
  description: 'Memory Maze is a challenging puzzle game that puts your memory and navigation skills to the test. Players are briefly shown a randomly generated maze for a few seconds before it disappears. Using only their memory, they must guide their character from the start to the finish without hitting invisible walls.',
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
