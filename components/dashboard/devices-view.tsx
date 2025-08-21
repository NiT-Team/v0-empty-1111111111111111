"use client"

import { useState } from "react"
import type { Device, User } from "@/types"
import DeviceFormModal from "@/components/forms/device-form-modal"
import AccessGuard from "@/components/ui/access-guard"
import { usePermissions } from "@/hooks/use-permissions"

interface DevicesViewProps {
  devices: Device[]
  setDevices: (devices: Device[]) => void
  user: User
}

export default function DevicesView({ devices, setDevices, user }: DevicesViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | undefined>(undefined)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")

  const { hasPermission } = usePermissions(user)

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.ip.includes(searchTerm),
  )

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAddDevice = () => {
    setModalMode("add")
    setEditingDevice(undefined)
    setIsModalOpen(true)
  }

  const handleEditDevice = (device: Device) => {
    setModalMode("edit")
    setEditingDevice(device)
    setIsModalOpen(true)
  }

  const handleDeleteDevice = (deviceId: number) => {
    if (confirm("Are you sure you want to delete this device?")) {
      const updatedDevices = devices.filter((device) => device.id !== deviceId)
      setDevices(updatedDevices)

      // Update localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const userIndex = users.findIndex((u: User) => u.id === user.id)
      if (userIndex !== -1) {
        users[userIndex].devices = updatedDevices
        localStorage.setItem("users", JSON.stringify(users))
        localStorage.setItem("currentUser", JSON.stringify(users[userIndex]))
      }
    }
  }

  const handleSaveDevice = (deviceData: Omit<Device, "id">) => {
    let updatedDevices: Device[]

    if (modalMode === "add") {
      const newDevice: Device = {
        ...deviceData,
        id: Math.max(0, ...devices.map((d) => d.id)) + 1,
      }
      updatedDevices = [...devices, newDevice]
    } else {
      updatedDevices = devices.map((device) =>
        device.id === editingDevice?.id ? { ...deviceData, id: editingDevice.id } : device,
      )
    }

    setDevices(updatedDevices)

    // Update localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const userIndex = users.findIndex((u: User) => u.id === user.id)
    if (userIndex !== -1) {
      users[userIndex].devices = updatedDevices
      localStorage.setItem("users", JSON.stringify(users))
      localStorage.setItem("currentUser", JSON.stringify(users[userIndex]))
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-6">
        <div className="flex items-center mb-4 lg:mb-0">
          <h2 className="text-2xl font-bold text-gray-800">Your Devices</h2>
          <span className="ml-3 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {filteredDevices.length} items
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search devices..."
              className="pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
            >
              <i className="fas fa-th-large"></i>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md ${viewMode === "table" ? "bg-white shadow-sm" : ""}`}
            >
              <i className="fas fa-table"></i>
            </button>
          </div>

          <AccessGuard user={user} requiredPermission={{ module: "devices", action: "create" }}>
            <button
              onClick={handleAddDevice}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md flex items-center"
            >
              <i className="fas fa-plus mr-2"></i> Add Device
            </button>
          </AccessGuard>
        </div>
      </div>

      {filteredDevices.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <i className="fas fa-laptop-house text-gray-400 text-3xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No devices found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first device"}
          </p>
          {!searchTerm && (
            <AccessGuard user={user} requiredPermission={{ module: "devices", action: "create" }}>
              <button
                onClick={handleAddDevice}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md"
              >
                <i className="fas fa-plus mr-2"></i> Add Your First Device
              </button>
            </AccessGuard>
          )}
        </div>
      ) : (
        <div
          className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "overflow-x-auto"}
        >
          {viewMode === "grid" ? (
            filteredDevices.map((device) => (
              <div key={device.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <i className="fas fa-laptop text-blue-600"></i>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                    {device.status}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-800 mb-2">{device.name}</h3>
                <p className="text-sm text-gray-600 mb-1">{device.model}</p>
                <p className="text-sm text-gray-500 mb-3">{device.ip}</p>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{device.type}</span>
                  <div className="flex gap-2">
                    <AccessGuard user={user} requiredPermission={{ module: "devices", action: "edit" }}>
                      <button onClick={() => handleEditDevice(device)} className="text-blue-600 hover:text-blue-800">
                        <i className="fas fa-edit"></i>
                      </button>
                    </AccessGuard>
                    <AccessGuard user={user} requiredPermission={{ module: "devices", action: "delete" }}>
                      <button onClick={() => handleDeleteDevice(device.id)} className="text-red-600 hover:text-red-800">
                        <i className="fas fa-trash"></i>
                      </button>
                    </AccessGuard>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-lg p-2 mr-3">
                          <i className="fas fa-laptop text-blue-600"></i>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{device.name}</div>
                          <div className="text-sm text-gray-500">{device.model}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device.ip}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                        {device.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <AccessGuard user={user} requiredPermission={{ module: "devices", action: "edit" }}>
                        <button
                          onClick={() => handleEditDevice(device)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      </AccessGuard>
                      <AccessGuard user={user} requiredPermission={{ module: "devices", action: "delete" }}>
                        <button
                          onClick={() => handleDeleteDevice(device.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </AccessGuard>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <DeviceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDevice}
        device={editingDevice}
        mode={modalMode}
      />
    </div>
  )
}
