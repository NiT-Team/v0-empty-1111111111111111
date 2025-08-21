"use client"

import { useState, useEffect } from "react"
import type { User, UserPermissions } from "@/types"

interface AccessRightsViewProps {
  currentUser: User
}

export default function AccessRightsView({ currentUser }: AccessRightsViewProps) {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem("users") || "[]")
    setUsers(savedUsers)
  }, [])

  const getDefaultPermissions = (role: string): UserPermissions => {
    switch (role) {
      case "portal":
        return {
          devices: { view: false, create: false, edit: false, delete: false, export: false },
          assets: { view: false, create: false, edit: false, delete: false, export: false },
          users: { view: false, create: false, edit: false, delete: false, manageRoles: false },
          tickets: { view: true, create: true, edit: true, delete: false, assign: false, close: false },
          maintenance: { view: false, create: false, edit: false, delete: false, schedule: false },
          reports: { view: false, create: false, edit: false, delete: false, export: false },
          settings: { view: false, edit: false, system: false, backup: false },
          development: {
            apiAccess: false,
            systemLogs: false,
            databaseAccess: false,
            debugging: false,
            systemMonitoring: false,
          },
        }
      case "admin":
        return {
          devices: { view: true, create: true, edit: true, delete: true, export: true },
          assets: { view: true, create: true, edit: true, delete: true, export: true },
          users: { view: true, create: true, edit: true, delete: false, manageRoles: true },
          tickets: { view: true, create: true, edit: true, delete: true, assign: true, close: true },
          maintenance: { view: true, create: true, edit: true, delete: true, schedule: true },
          reports: { view: true, create: true, edit: true, delete: false, export: true },
          settings: { view: true, edit: true, system: false, backup: true },
          development: {
            apiAccess: false,
            systemLogs: true,
            databaseAccess: false,
            debugging: false,
            systemMonitoring: true,
          },
        }
      default: // regular user
        return {
          devices: { view: true, create: false, edit: false, delete: false, export: false },
          assets: { view: true, create: false, edit: false, delete: false, export: false },
          users: { view: false, create: false, edit: false, delete: false, manageRoles: false },
          tickets: { view: true, create: true, edit: false, delete: false, assign: false, close: false },
          maintenance: { view: true, create: false, edit: false, delete: false, schedule: false },
          reports: { view: true, create: false, edit: false, delete: false, export: false },
          settings: { view: false, edit: false, system: false, backup: false },
          development: {
            apiAccess: false,
            systemLogs: false,
            databaseAccess: false,
            debugging: false,
            systemMonitoring: false,
          },
        }
    }
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    setPermissions(user.permissions || getDefaultPermissions(user.role))
  }

  const handlePermissionChange = (module: keyof UserPermissions, action: string, value: boolean) => {
    if (!permissions) return

    setPermissions((prev) => ({
      ...prev!,
      [module]: {
        ...prev![module],
        [action]: value,
      },
    }))
  }

  const handleSavePermissions = () => {
    if (!selectedUser || !permissions) return

    const updatedUsers = users.map((user) => (user.id === selectedUser.id ? { ...user, permissions } : user))

    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Update selected user
    const updatedUser = updatedUsers.find((u) => u.id === selectedUser.id)
    if (updatedUser) setSelectedUser(updatedUser)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
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

  if (currentUser.role !== "superuser" && currentUser.role !== "admin") {
    return (
      <div className="text-center py-12">
        <i className="fas fa-lock text-gray-400 text-6xl mb-4"></i>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Denied</h3>
        <p className="text-gray-500">You don't have permission to manage access rights.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Users List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Users</h3>
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedUser?.id === user.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-gray-500">{user.uniqueCode}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions Panel */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
        {selectedUser ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Access Rights for {selectedUser.username}</h3>
                <p className="text-sm text-gray-500">Manage user permissions and access levels</p>
              </div>
              <button
                onClick={handleSavePermissions}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Save Changes
              </button>
            </div>

            {permissions && (
              <div className="space-y-6">
                {Object.entries(permissions).map(([module, modulePermissions]) => (
                  <div key={module} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 capitalize">{module}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(modulePermissions).map(([action, hasPermission]) => (
                        <label key={action} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={hasPermission}
                            onChange={(e) =>
                              handlePermissionChange(module as keyof UserPermissions, action, e.target.checked)
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            disabled={selectedUser.role === "superuser"}
                          />
                          <span className="text-sm capitalize">{action}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedUser.role === "superuser" && (
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-700">
                  <i className="fas fa-crown mr-2"></i>
                  Superuser has all permissions and cannot be modified.
                </p>
              </div>
            )}

            {selectedUser.role === "portal" && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  <i className="fas fa-ticket-alt mr-2"></i>
                  Portal users are designed for ticket creation and self-service support.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <i className="fas fa-users text-gray-400 text-6xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a User</h3>
            <p className="text-gray-500">Choose a user from the list to manage their access rights.</p>
          </div>
        )}
      </div>
    </div>
  )
}
