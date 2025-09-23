"use client"

import * as React from "react"
import { Moon, Sun, Star } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  // Ensure theme is not undefined on initial render
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
        <div className="h-8 w-14 rounded-full bg-secondary animate-pulse" />
    );
  }

  const handleToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "relative inline-flex items-center h-8 w-14 rounded-full bg-secondary transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      )}
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={cn(
          "absolute inset-y-0 left-0 flex items-center justify-center h-8 w-8 transform transition-transform duration-300 ease-in-out",
          theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
        )}
      >
        <span className="relative h-6 w-6 flex items-center justify-center rounded-full bg-background shadow-md">
            <Sun className="h-4 w-4 text-yellow-500 transition-opacity duration-300 ease-in-out opacity-100 dark:opacity-0" />
            <Moon className="absolute h-4 w-4 text-slate-400 transition-opacity duration-300 ease-in-out opacity-0 dark:opacity-100" />
             <Star className="absolute h-2 w-2 right-1 top-1 text-slate-400 transition-opacity duration-300 ease-in-out opacity-0 dark:opacity-100" />
        </span>
      </span>
    </button>
  )
}
