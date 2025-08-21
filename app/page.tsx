"use client"

import { useState, useEffect } from "react"
import LoginScreen from "@/components/auth/login-screen"
import RegisterScreen from "@/components/auth/register-screen"
import Dashboard from "@/components/dashboard/dashboard"
import TicketPortal from "@/components/portal/ticket-portal"
import type { User } from "@/types"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<"login" | "register" | "dashboard" | "portal">("login")
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCurrentUser(user)
      setCurrentScreen(user.role === "admin" || user.role === "superuser" ? "dashboard" : "portal")
    }
  }, [])

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    localStorage.setItem("currentUser", JSON.stringify(user))
    setCurrentScreen(user.role === "admin" || user.role === "superuser" ? "dashboard" : "portal")
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem("currentUser")
    setCurrentScreen("login")
  }

  const switchToRegister = () => setCurrentScreen("register")
  const switchToLogin = () => setCurrentScreen("login")

  if (currentScreen === "portal" && currentUser) {
    return <TicketPortal currentUser={currentUser} onBackToLogin={handleLogout} />
  }

  if (currentScreen === "dashboard" && currentUser) {
    return <Dashboard user={currentUser} onLogout={handleLogout} />
  }

  if (currentScreen === "register") {
    return <RegisterScreen onSwitchToLogin={switchToLogin} onLogin={handleLogin} />
  }

  return <LoginScreen onSwitchToRegister={switchToRegister} onLogin={handleLogin} />
}
