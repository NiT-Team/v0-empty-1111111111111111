"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  Server,
  HardDrive,
  Users,
  AlertTriangle,
  Package,
  Calendar,
  CheckSquare,
  BookIcon as AddressBook,
} from "lucide-react"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AnalyticsDashboard() {
  const [devices, setDevices] = useState([])
  const [assets, setAssets] = useState([])
  const [users, setUsers] = useState([])
  const [maintenanceTasks, setMaintenanceTasks] = useState([])
  const [inventoryItems, setInventoryItems] = useState([])
  const [contacts, setContacts] = useState([])
  const [events, setEvents] = useState([])
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    // Load data from localStorage
    setDevices(JSON.parse(localStorage.getItem("devices") || "[]"))
    setAssets(JSON.parse(localStorage.getItem("assets") || "[]"))
    setUsers(JSON.parse(localStorage.getItem("users") || "[]"))
    setMaintenanceTasks(JSON.parse(localStorage.getItem("maintenanceTasks") || "[]"))
    setInventoryItems(JSON.parse(localStorage.getItem("infonit_inventory") || "[]"))
    setContacts(JSON.parse(localStorage.getItem("infonit_contacts") || "[]"))
    setEvents(JSON.parse(localStorage.getItem("infonit_events") || "[]"))
    setTasks(JSON.parse(localStorage.getItem("infonit_tasks") || "[]"))
  }, [])

  // Calculate metrics
  const deviceStatusData = devices.reduce((acc, device) => {
    acc[device.status] = (acc[device.status] || 0) + 1
    return acc
  }, {})

  const deviceStatusChart = Object.entries(deviceStatusData).map(([status, count]) => ({
    name: status,
    value: count,
  }))

  const assetTypeData = assets.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + 1
    return acc
  }, {})

  const assetTypeChart = Object.entries(assetTypeData).map(([type, count]) => ({
    name: type,
    count,
  }))

  const maintenanceStatusData = maintenanceTasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1
    return acc
  }, {})

  const inventoryCategoryData = inventoryItems.reduce((acc, item) => {
    const category = item.category.replace("-", " ")
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {})

  const inventoryCategoryChart = Object.entries(inventoryCategoryData).map(([category, count]) => ({
    name: category,
    count,
  }))

  const contactCategoryData = contacts.reduce((acc, contact) => {
    acc[contact.category] = (acc[contact.category] || 0) + 1
    return acc
  }, {})

  const contactCategoryChart = Object.entries(contactCategoryData).map(([category, count]) => ({
    name: category,
    count,
  }))

  const taskStatusData = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1
    return acc
  }, {})

  const totalDevices = devices.length
  const activeDevices = devices.filter((d) => d.status === "Active").length
  const totalAssets = assets.length
  const overdueTasks = maintenanceTasks.filter((t) => t.status === "Overdue").length
  const totalInventoryItems = inventoryItems.length
  const lowStockItems = inventoryItems.filter(
    (item) => item.status === "low-stock" || item.status === "out-of-stock",
  ).length
  const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + (item.totalValue || 0), 0)

  const totalContacts = contacts.length
  const activeContacts = contacts.filter((c) => c.status === "active").length
  const upcomingEvents = events.filter((e) => new Date(e.startDate) > new Date()).length
  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const pendingTasks = tasks.filter((t) => t.status === "todo" || t.status === "in-progress").length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDevices}</div>
            <p className="text-xs text-muted-foreground">{activeDevices} active devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Digital Assets</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
            <p className="text-xs text-muted-foreground">Software & licenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInventoryItems}</div>
            <p className="text-xs text-muted-foreground">${totalInventoryValue.toLocaleString()} total value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacts</CardTitle>
            <AddressBook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
            <p className="text-xs text-muted-foreground">{activeContacts} active contacts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">{upcomingEvents} upcoming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">{completedTasks} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueTasks + lowStockItems + pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              {overdueTasks} overdue, {lowStockItems} low stock, {pendingTasks} pending
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Device Status Distribution</CardTitle>
            <CardDescription>Current status of all devices</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceStatusChart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceStatusChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Types</CardTitle>
            <CardDescription>Distribution of digital assets by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assetTypeChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Categories</CardTitle>
            <CardDescription>Distribution of contacts by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contactCategoryChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Status Overview</CardTitle>
            <CardDescription>Current status of all tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(taskStatusData).map(([status, count]) => (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize">{status.replace("-", " ")}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Tasks Overview</CardTitle>
            <CardDescription>Current status of maintenance tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(maintenanceStatusData).map(([status, count]) => (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground">{status}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Status Overview</CardTitle>
            <CardDescription>Current inventory stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {inventoryItems.filter((item) => item.status === "in-stock").length}
                </div>
                <div className="text-sm text-muted-foreground">In Stock</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {inventoryItems.filter((item) => item.status === "low-stock").length}
                </div>
                <div className="text-sm text-muted-foreground">Low Stock</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {inventoryItems.filter((item) => item.status === "out-of-stock").length}
                </div>
                <div className="text-sm text-muted-foreground">Out of Stock</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
