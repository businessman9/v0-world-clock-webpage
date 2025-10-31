"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

interface City {
  name: string
  timezone: string
}

interface Config {
  clockFontSize: number
  clockFontColor: string
  cityFontSize: number
  cityFontColor: string
  titleFontSize: number
  titleFontColor: string
  backgroundColor: string
  shadowEffect: boolean
}

const cities: City[] = [
  { name: "New York", timezone: "America/New_York" },
  { name: "Monterey", timezone: "America/Los_Angeles" },
  { name: "Tokyo", timezone: "Asia/Tokyo" },
  { name: "Kaohsiung", timezone: "Asia/Taipei" },
  { name: "Paris", timezone: "Europe/Paris" },
]

const defaultConfig: Config = {
  clockFontSize: 60,
  clockFontColor: "#000000",
  cityFontSize: 20,
  cityFontColor: "#666666",
  titleFontSize: 48,
  titleFontColor: "#000000",
  backgroundColor: "#f8f8f8",
  shadowEffect: true,
}

export default function WorldClock() {
  const [times, setTimes] = useState<Record<string, string>>({})
  const [config, setConfig] = useState<Config>(defaultConfig)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/config.txt")
        const text = await response.text()
        const newConfig = { ...defaultConfig }

        text.split("\n").forEach((line) => {
          const trimmed = line.trim()
          if (trimmed && !trimmed.startsWith("#")) {
            const [key, value] = trimmed.split("=")
            if (key && value) {
              const k = key.trim()
              const v = value.trim()

              if (k === "clock_font_size") newConfig.clockFontSize = Number.parseInt(v)
              else if (k === "clock_font_color") newConfig.clockFontColor = v
              else if (k === "city_font_size") newConfig.cityFontSize = Number.parseInt(v)
              else if (k === "city_font_color") newConfig.cityFontColor = v
              else if (k === "title_font_size") newConfig.titleFontSize = Number.parseInt(v)
              else if (k === "title_font_color") newConfig.titleFontColor = v
              else if (k === "background_color") newConfig.backgroundColor = v
              else if (k === "shadow_effect") newConfig.shadowEffect = v === "true"
            }
          }
        })

        setConfig(newConfig)
      } catch (error) {
        console.error("Failed to load config:", error)
      }
    }

    loadConfig()
  }, [])

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: Record<string, string> = {}
      cities.forEach((city) => {
        const time = new Date().toLocaleTimeString("en-US", {
          timeZone: city.timezone,
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
        newTimes[city.name] = time
      })
      setTimes(newTimes)
    }

    updateTimes()
    const interval = setInterval(updateTimes, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full max-w-4xl">
      <h1
        className="font-bold text-center mb-12"
        style={{
          fontSize: `${config.titleFontSize}px`,
          color: config.titleFontColor,
        }}
      >
        World Clock
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map((city) => (
          <Card
            key={city.name}
            className="p-8 flex flex-col items-center justify-center gap-4 transition-shadow"
            style={{
              backgroundColor: config.backgroundColor,
              boxShadow: config.shadowEffect ? "0 10px 15px -3px rgb(0 0 0 / 0.1)" : "none",
            }}
          >
            <h2
              className="font-medium"
              style={{
                fontSize: `${config.cityFontSize}px`,
                color: config.cityFontColor,
              }}
            >
              {city.name}
            </h2>
            <time
              className="font-mono font-bold tabular-nums"
              style={{
                fontSize: `${config.clockFontSize}px`,
                color: config.clockFontColor,
              }}
            >
              {times[city.name] || "00:00:00"}
            </time>
          </Card>
        ))}
      </div>
    </div>
  )
}
