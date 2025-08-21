"use client"

import { useState } from "react"
import type { User, UserProfile } from "@/types"
import NotificationCenter from "./notification-center"
import GlobalSearch from "./global-search"
import UserProfileModal from "@/components/forms/user-profile-modal"

interface HeaderProps {
  user: User
  onLogout: () => void
  onMenuToggle: () => void
}

export default function Header({ user, onLogout, onMenuToggle }: HeaderProps) {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSaveProfile = (profile: UserProfile) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const updatedUsers = users.map((u: User) => (u.id === user.id ? { ...u, profile } : u))
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Update current user in localStorage
    const updatedUser = { ...user, profile }
    localStorage.setItem("currentUser", JSON.stringify(updatedUser))
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "superuser":
        return "bg-purple-100 text-purple-800"
      case "admin":
        return "bg-red-100 text-red-800"
      case "user":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="flex justify-between h-16 items-center px-6">
        <div className="flex items-center">
          <button onClick={onMenuToggle} className="md:hidden mr-4 text-gray-500 hover:text-gray-700">
            <i className="fas fa-bars text-xl"></i>
          </button>
          <div className="bg-blue-100 rounded-lg p-2 mr-3">
            <i className="fas fa-network-wired text-blue-600 text-xl"></i>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Infonit Digital Management</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <GlobalSearch />
          </div>

          <div className="flex items-center space-x-2">
            <NotificationCenter />

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 flex items-center justify-center">
                  <i className="fas fa-user text-gray-600"></i>
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-800">{user.username}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  {user.profile && (
                    <span className="text-xs text-gray-500">
                      {user.profile.firstName} {user.profile.lastName}
                    </span>
                  )}
                </div>
                <i className="fas fa-chevron-down text-gray-400"></i>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => {
                      setShowProfileModal(true)
                      setShowUserMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <i className="fas fa-user-edit mr-2"></i>
                    Edit Profile
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSave={handleSaveProfile}
        user={user}
      />
    </div>
  )
}
