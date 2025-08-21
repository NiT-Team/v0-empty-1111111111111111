"use client"

import type React from "react"

import { useState } from "react"
import type { User } from "@/types"

interface LoginScreenProps {
  onLogin: (user: User) => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (username === "infonit" && password === "admininfonit") {
      const superuser: User = {
        id: 0,
        username: "infonit",
        password: "admininfonit",
        role: "superuser",
        uniqueCode: "SUPER-001",
        devices: [],
        assets: [],
        profile: {
          firstName: "Super",
          lastName: "Admin",
          email: "admin@infonit.com",
          phone: "+1-555-0000",
          department: "IT Administration",
          position: "System Administrator",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        permissions: {
          devices: { view: true, create: true, edit: true, delete: true },
          assets: { view: true, create: true, edit: true, delete: true },
          users: { view: true, create: true, edit: true, delete: true },
          tickets: { view: true, create: true, edit: true, delete: true },
          maintenance: { view: true, create: true, edit: true, delete: true },
          reports: { view: true, create: true, edit: true, delete: true },
          settings: { view: true, edit: true },
        },
        lastLogin: new Date().toISOString(),
        isActive: true,
      }
      onLogin(superuser)
      return
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const user = users.find((u: User) => u.username === username && u.password === password)

    if (user) {
      user.lastLogin = new Date().toISOString()
      const updatedUsers = users.map((u: User) => (u.id === user.id ? user : u))
      localStorage.setItem("users", JSON.stringify(updatedUsers))
      onLogin(user)
    } else {
      setError("Invalid username or password")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto bg-blue-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
            <i className="fas fa-network-wired text-blue-600 text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Infonit Digital Management</h1>
          <p className="text-gray-600 mt-2">Securely manage all your devices and digital assets</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-user text-gray-400"></i>
              </div>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-lock text-gray-400"></i>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 transition"
                required
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold shadow-md transition duration-300 transform hover:-translate-y-0.5"
          >
            <i className="fas fa-sign-in-alt mr-2"></i> Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
