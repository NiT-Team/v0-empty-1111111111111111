"use client"

import { useState } from "react"
import type { User } from "@/types"

interface SettingsViewProps {
  user: User
}

export default function SettingsView({ user }: SettingsViewProps) {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const handleChangePassword = () => {
    setShowPasswordDialog(true)
    setPasswordError("")
  }

  const handlePasswordSubmit = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const updatedUsers = users.map((u: User) => (u.id === user.id ? { ...u, password: newPassword } : u))

    localStorage.setItem("users", JSON.stringify(updatedUsers))
    localStorage.setItem("currentUser", JSON.stringify({ ...user, password: newPassword }))

    setShowPasswordDialog(false)
    setNewPassword("")
    setConfirmPassword("")
    alert("Password changed successfully!")
  }

  const handleExportData = () => {
    const data = {
      users: JSON.parse(localStorage.getItem("users") || "[]"),
      devices: JSON.parse(localStorage.getItem("infonit_devices") || "[]"),
      assets: JSON.parse(localStorage.getItem("infonit_assets") || "[]"),
      tasks: JSON.parse(localStorage.getItem("infonit_maintenance_tasks") || "[]"),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `infonit-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            if (data.users) localStorage.setItem("users", JSON.stringify(data.users))
            if (data.devices) localStorage.setItem("infonit_devices", JSON.stringify(data.devices))
            if (data.assets) localStorage.setItem("infonit_assets", JSON.stringify(data.assets))
            if (data.tasks) localStorage.setItem("infonit_maintenance_tasks", JSON.stringify(data.tasks))
            alert("Data imported successfully! Please refresh the page.")
          } catch (error) {
            alert("Invalid file format")
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      localStorage.removeItem("infonit_devices")
      localStorage.removeItem("infonit_assets")
      localStorage.removeItem("infonit_maintenance_tasks")
      alert("Data cleared successfully! User accounts remain intact.")
    }
  }

  return (
    <div>
      <div className="mb-8 border-b pb-6">
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-600 mt-2">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Settings</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={user.username}
                disabled
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                value={user.role}
                disabled
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User Code</label>
              <input
                type="text"
                value={user.uniqueCode}
                disabled
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <button
              onClick={handleChangePassword}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Application Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Settings</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                <p className="text-xs text-gray-500">Receive maintenance reminders via email</p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Dark Mode</label>
                <p className="text-xs text-gray-500">Switch to dark theme</p>
              </div>
              <input type="checkbox" className="rounded" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Auto-save</label>
                <p className="text-xs text-gray-500">Automatically save changes</p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Management</h3>

          <div className="space-y-4">
            <button
              onClick={handleExportData}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Export Data
            </button>

            <button
              onClick={handleImportData}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Import Data
            </button>

            <button
              onClick={handleClearData}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Clear All Data
            </button>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">System Information</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Version:</span>
              <span className="font-medium">1.0.0</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-medium">2024-01-15</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Storage Used:</span>
              <span className="font-medium">2.3 MB</span>
            </div>

            <hr className="my-3" />
            <div className="flex justify-between">
              <span className="text-gray-600">Developed by:</span>
              <span className="font-medium text-blue-600">Infonit-Development</span>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Dialog */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {passwordError && <div className="text-red-600 text-sm">{passwordError}</div>}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPasswordDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
