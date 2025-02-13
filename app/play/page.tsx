"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Settings, Music, RefreshCcw } from "lucide-react"
import { getLyrics } from "@/app/actions"

export default function TypingTest() {
  const [songUrl, setSongUrl] = useState("")
  const [startSection, setStartSection] = useState("")
  const [endSection, setEndSection] = useState("")
  const [currentLyrics, setCurrentLyrics] = useState("")
  const [userInput, setUserInput] = useState("")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [progress, setProgress] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fetchLyrics = async () => {
    if (!songUrl || !startSection || !endSection) return
    setIsLoading(true)
    const lyrics = await getLyrics(songUrl, startSection, endSection)
    setCurrentLyrics(lyrics)
    setIsLoading(false)
    resetTest()
  }

  const calculateStats = useCallback(() => {
    if (!startTime) return

    const timeElapsed = (Date.now() - startTime) / 1000 / 60 // in minutes
    const wordsTyped = userInput.trim().split(/\s+/).length
    const newWpm = Math.round(wordsTyped / timeElapsed)

    const correctChars = userInput.split("").filter((char, i) => char === currentLyrics[i]).length
    const newAccuracy = Math.round((correctChars / userInput.length) * 100) || 100

    setWpm(newWpm)
    setAccuracy(newAccuracy)
    setProgress((userInput.length / currentLyrics.length) * 100)
  }, [startTime, userInput, currentLyrics])

  useEffect(() => {
    if (userInput.length > 0 && !startTime) {
      setStartTime(Date.now())
    }

    if (userInput === currentLyrics) {
      setIsFinished(true)
    }

    calculateStats()
  }, [userInput, currentLyrics, startTime, calculateStats])

  const resetTest = () => {
    setUserInput("")
    setStartTime(null)
    setWpm(0)
    setAccuracy(100)
    setProgress(0)
    setIsFinished(false)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-6 w-6" />
            <span className="font-bold text-xl">LyricsType</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Enter Genius song URL"
            value={songUrl}
            onChange={(e) => setSongUrl(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Start section (e.g. [Chorus])"
              value={startSection}
              onChange={(e) => setStartSection(e.target.value)}
            />
            <Input
              type="text"
              placeholder="End section (e.g. [Outro])"
              value={endSection}
              onChange={(e) => setEndSection(e.target.value)}
            />
          </div>
          <Button onClick={fetchLyrics} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load Lyrics"}
          </Button>
        </div>

        {currentLyrics && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <div className="text-2xl font-mono">
                  <span className="text-muted-foreground">WPM: </span>
                  {wpm}
                </div>
                <div className="text-2xl font-mono">
                  <span className="text-muted-foreground">ACC: </span>
                  {accuracy}%
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={resetTest}>
                <RefreshCcw className="h-5 w-5" />
              </Button>
            </div>

            <Progress value={progress} className="h-2" />

            <div className="relative">
              <div
                className="font-mono text-xl leading-relaxed whitespace-pre-wrap text-muted-foreground"
                aria-hidden="true"
              >
                {currentLyrics.split("").map((char, i) => {
                  const userChar = userInput[i]
                  const isCorrect = userChar === char
                  const isCurrent = i === userInput.length

                  return (
                    <span
                      key={i}
                      className={`${
                        userChar ? (isCorrect ? "text-primary" : "text-destructive") : ""
                      } ${isCurrent ? "bg-primary/20" : ""}`}
                    >
                      {char}
                    </span>
                  )
                })}
              </div>

              <textarea
                className="absolute inset-0 w-full h-full opacity-0 resize-none"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isFinished}
                autoFocus
                aria-label="Type the lyrics"
              />
            </div>

            {isFinished && (
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Test Complete!</h2>
                <div className="flex justify-center gap-4">
                  <div className="text-xl">
                    <div className="text-muted-foreground text-sm">WPM</div>
                    {wpm}
                  </div>
                  <div className="text-xl">
                    <div className="text-muted-foreground text-sm">Accuracy</div>
                    {accuracy}%
                  </div>
                </div>
                <Button onClick={resetTest}>Try Again</Button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Lyrics sourced from Genius</p>
        </div>
      </footer>
    </div>
  )
}
