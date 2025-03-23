import type { Metadata } from 'next'
import Script from "next/script"; 
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
      <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-EPETNFWVQT"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-EPETNFWVQT');
</script>
      <body>{children}</body>
    </html>
  )
}
