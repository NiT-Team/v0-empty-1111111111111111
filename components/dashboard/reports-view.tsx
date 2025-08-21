"use client"

import type { Device, Asset, MaintenanceTask } from "@/types"

interface ReportsViewProps {
  devices: Device[]
  assets: Asset[]
  tasks: MaintenanceTask[]
}

export default function ReportsView({ devices, assets, tasks }: ReportsViewProps) {
  const deviceStats = {
    total: devices.length,
    active: devices.filter((d) => d.status === "Active").length,
    inactive: devices.filter((d) => d.status === "Inactive").length,
    maintenance: devices.filter((d) => d.status === "Maintenance").length,
  }

  const assetStats = {
    total: assets.length,
    active: assets.filter((a) => a.status === "Active").length,
    expired: assets.filter((a) => a.status === "Expired").length,
    expiringSoon: assets.filter((a) => a.status === "Expiring Soon").length,
  }

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "Completed").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    scheduled: tasks.filter((t) => t.status === "Scheduled").length,
    overdue: tasks.filter((t) => t.status === "Overdue").length,
  }

  const handleExportPDF = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      deviceStats,
      assetStats,
      taskStats,
      devices,
      assets,
      tasks,
    }

    // Create a simple text report for PDF export
    const reportText = `
INFONIT DIGITAL MANAGEMENT SYSTEM REPORT
Generated: ${new Date().toLocaleDateString()}

SUMMARY:
- Total Devices: ${deviceStats.total}
- Total Assets: ${assetStats.total}
- Total Tasks: ${taskStats.total}

DEVICE STATUS:
- Active: ${deviceStats.active}
- Inactive: ${deviceStats.inactive}
- Maintenance: ${deviceStats.maintenance}

ASSET STATUS:
- Active: ${assetStats.active}
- Expired: ${assetStats.expired}
- Expiring Soon: ${assetStats.expiringSoon}

MAINTENANCE STATUS:
- Completed: ${taskStats.completed}
- In Progress: ${taskStats.inProgress}
- Scheduled: ${taskStats.scheduled}
- Overdue: ${taskStats.overdue}
    `

    const blob = new Blob([reportText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `infonit-report-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportExcel = () => {
    const data = {
      summary: { deviceStats, assetStats, taskStats },
      devices,
      assets,
      tasks,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `infonit-data-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCSV = () => {
    // Create CSV for devices
    const deviceCSV = [
      "ID,Name,Type,Model,IP,Status",
      ...devices.map((d) => `${d.id},"${d.name}","${d.type}","${d.model}","${d.ip}","${d.status}"`),
    ].join("\n")

    const blob = new Blob([deviceCSV], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `infonit-devices-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-8 border-b pb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
        <p className="text-gray-600 mt-2">Overview of your digital infrastructure</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Devices</p>
              <p className="text-3xl font-bold text-gray-900">{deviceStats.total}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <i className="fas fa-laptop text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Digital Assets</p>
              <p className="text-3xl font-bold text-gray-900">{assetStats.total}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <i className="fas fa-cube text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{taskStats.total}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <i className="fas fa-tools text-green-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Device Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Device Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active</span>
              <span className="text-sm font-medium text-green-600">{deviceStats.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Inactive</span>
              <span className="text-sm font-medium text-red-600">{deviceStats.inactive}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Maintenance</span>
              <span className="text-sm font-medium text-yellow-600">{deviceStats.maintenance}</span>
            </div>
          </div>
        </div>

        {/* Asset Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Asset Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active</span>
              <span className="text-sm font-medium text-green-600">{assetStats.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Expired</span>
              <span className="text-sm font-medium text-red-600">{assetStats.expired}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Expiring Soon</span>
              <span className="text-sm font-medium text-yellow-600">{assetStats.expiringSoon}</span>
            </div>
          </div>
        </div>

        {/* Maintenance Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Maintenance Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-sm font-medium text-green-600">{taskStats.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="text-sm font-medium text-blue-600">{taskStats.inProgress}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Scheduled</span>
              <span className="text-sm font-medium text-yellow-600">{taskStats.scheduled}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overdue</span>
              <span className="text-sm font-medium text-red-600">{taskStats.overdue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Reports</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center"
          >
            <i className="fas fa-file-pdf mr-2"></i> Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center"
          >
            <i className="fas fa-file-excel mr-2"></i> Export Excel
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center"
          >
            <i className="fas fa-file-csv mr-2"></i> Export CSV
          </button>
        </div>
      </div>
    </div>
  )
}
