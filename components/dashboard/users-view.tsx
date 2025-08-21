"use client"

import { useState, useEffect } from "react"
import type { User } from "@/types"
import UserFormModal from "@/components/forms/user-form-modal"

interface UsersViewProps {
  currentUser: User
}

export default function UsersView({ currentUser }: UsersViewProps) {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined)

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem("users") || "[]")
    setUsers(savedUsers)
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddUser = () => {
    setEditingUser(undefined)
    setIsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleSaveUser = (userData: User) => {
    let updatedUsers: User[]

    if (editingUser) {
      updatedUsers = users.map((u) => (u.id === userData.id ? userData : u))
    } else {
      updatedUsers = [...users, userData]
    }

    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "superuser":
        return "bg-purple-100 text-purple-800"
      case "admin":
        return "bg-red-100 text-red-800"
      case "portal":
        return "bg-green-100 text-green-800"
      case "user":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-6">
        <div className="flex items-center mb-4 lg:mb-0">
          <h2 className="text-2xl font-bold text-gray-800">Users</h2>
          <span className="ml-3 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {filteredUsers.length} users
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>

          {currentUser.role === "admin" && (
            <button
              onClick={handleAddUser}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md flex items-center"
            >
              <i className="fas fa-plus mr-2"></i> Add User
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gray-100 rounded-full p-3">
                <i className="fas fa-user text-gray-600"></i>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
            </div>

            <h3 className="font-semibold text-gray-800 mb-2">{user.username}</h3>
            <p className="text-sm text-gray-500 mb-3">{user.uniqueCode}</p>

            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-500">Devices: {user.devices?.length || 0}</span>
                <br />
                <span className="text-gray-500">Assets: {user.assets?.length || 0}</span>
              </div>
              {currentUser.role === "admin" && user.id !== currentUser.id && (
                <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-800">
                  <i className="fas fa-edit"></i>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        user={editingUser}
      />
    </div>
  )
}
