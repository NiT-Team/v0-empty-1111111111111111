"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  Plus,
  Settings,
  Trash2,
  Move,
  MoreHorizontal,
  Server,
  Users,
  Package,
  Bell,
  TrendingUp,
  Activity,
  Clock,
  FileText,
  Zap,
  Shield,
} from "lucide-react"

interface Widget {
  id: string
  type: string
  title: string
  size: "small" | "medium" | "large" | "full"
  position: { x: number; y: number }
  config: any
  isVisible: boolean
}

interface WidgetType {
  id: string
  name: string
  description: string
  icon: any
  defaultSize: "small" | "medium" | "large" | "full"
  configurable: boolean
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658"]

const WIDGET_TYPES: WidgetType[] = [
  {
    id: "stats-card",
    name: "Stats Card",
    description: "Display key metrics and numbers",
    icon: TrendingUp,
    defaultSize: "small",
    configurable: true,
  },
  {
    id: "chart-bar",
    name: "Bar Chart",
    description: "Show data in bar chart format",
    icon: BarChart,
    defaultSize: "medium",
    configurable: true,
  },
  {
    id: "chart-pie",
    name: "Pie Chart",
    description: "Display data distribution in pie chart",
    icon: Activity,
    defaultSize: "medium",
    configurable: true,
  },
  {
    id: "chart-line",
    name: "Line Chart",
    description: "Show trends over time",
    icon: TrendingUp,
    defaultSize: "medium",
    configurable: true,
  },
  {
    id: "recent-activity",
    name: "Recent Activity",
    description: "Show latest system activities",
    icon: Clock,
    defaultSize: "medium",
    configurable: false,
  },
  {
    id: "quick-actions",
    name: "Quick Actions",
    description: "Frequently used action buttons",
    icon: Zap,
    defaultSize: "medium",
    configurable: true,
  },
  {
    id: "system-health",
    name: "System Health",
    description: "Monitor system performance",
    icon: Shield,
    defaultSize: "large",
    configurable: false,
  },
  {
    id: "notifications-feed",
    name: "Notifications Feed",
    description: "Latest notifications and alerts",
    icon: Bell,
    defaultSize: "medium",
    configurable: false,
  },
]

export default function DashboardWidgets() {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [availableWidgets, setAvailableWidgets] = useState<WidgetType[]>(WIDGET_TYPES)
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false)
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null)
  const [dashboardData, setDashboardData] = useState<any>({})

  useEffect(() => {
    // Load widgets from localStorage
    const savedWidgets = localStorage.getItem("infonit_dashboard_widgets")
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets))
    } else {
      // Default widgets
      const defaultWidgets: Widget[] = [
        {
          id: "widget-1",
          type: "stats-card",
          title: "Total Devices",
          size: "small",
          position: { x: 0, y: 0 },
          config: { metric: "devices", icon: "Server", color: "blue" },
          isVisible: true,
        },
        {
          id: "widget-2",
          type: "stats-card",
          title: "Active Users",
          size: "small",
          position: { x: 1, y: 0 },
          config: { metric: "users", icon: "Users", color: "green" },
          isVisible: true,
        },
        {
          id: "widget-3",
          type: "chart-pie",
          title: "Device Status",
          size: "medium",
          position: { x: 0, y: 1 },
          config: { dataSource: "device-status" },
          isVisible: true,
        },
        {
          id: "widget-4",
          type: "recent-activity",
          title: "Recent Activity",
          size: "medium",
          position: { x: 2, y: 0 },
          config: {},
          isVisible: true,
        },
      ]
      setWidgets(defaultWidgets)
      localStorage.setItem("infonit_dashboard_widgets", JSON.stringify(defaultWidgets))
    }

    // Load dashboard data
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    const devices = JSON.parse(localStorage.getItem("devices") || "[]")
    const assets = JSON.parse(localStorage.getItem("assets") || "[]")
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const inventory = JSON.parse(localStorage.getItem("infonit_inventory") || "[]")
    const notifications = JSON.parse(localStorage.getItem("infonit_notifications") || "[]")
    const tasks = JSON.parse(localStorage.getItem("infonit_tasks") || "[]")

    setDashboardData({
      devices,
      assets,
      users,
      inventory,
      notifications,
      tasks,
      metrics: {
        totalDevices: devices.length,
        activeDevices: devices.filter((d: any) => d.status === "Active").length,
        totalUsers: users.length,
        totalAssets: assets.length,
        unreadNotifications: notifications.filter((n: any) => !n.isRead).length,
        pendingTasks: tasks.filter((t: any) => t.status === "todo" || t.status === "in-progress").length,
      },
    })
  }

  const addWidget = (widgetType: WidgetType) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: widgetType.id,
      title: widgetType.name,
      size: widgetType.defaultSize,
      position: { x: 0, y: widgets.length },
      config: {},
      isVisible: true,
    }

    const updatedWidgets = [...widgets, newWidget]
    setWidgets(updatedWidgets)
    localStorage.setItem("infonit_dashboard_widgets", JSON.stringify(updatedWidgets))
    setIsAddWidgetOpen(false)
  }

  const removeWidget = (widgetId: string) => {
    const updatedWidgets = widgets.filter((w) => w.id !== widgetId)
    setWidgets(updatedWidgets)
    localStorage.setItem("infonit_dashboard_widgets", JSON.stringify(updatedWidgets))
  }

  const updateWidget = (widgetId: string, updates: Partial<Widget>) => {
    const updatedWidgets = widgets.map((w) => (w.id === widgetId ? { ...w, ...updates } : w))
    setWidgets(updatedWidgets)
    localStorage.setItem("infonit_dashboard_widgets", JSON.stringify(updatedWidgets))
  }

  const getGridClass = (size: string) => {
    switch (size) {
      case "small":
        return "col-span-1 row-span-1"
      case "medium":
        return "col-span-2 row-span-2"
      case "large":
        return "col-span-3 row-span-2"
      case "full":
        return "col-span-4 row-span-2"
      default:
        return "col-span-1 row-span-1"
    }
  }

  const renderWidget = (widget: Widget) => {
    const { type, title, config } = widget

    switch (type) {
      case "stats-card":
        return (
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              {config.icon === "Server" && <Server className="h-4 w-4 text-muted-foreground" />}
              {config.icon === "Users" && <Users className="h-4 w-4 text-muted-foreground" />}
              {config.icon === "Package" && <Package className="h-4 w-4 text-muted-foreground" />}
              {config.icon === "Bell" && <Bell className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {config.metric === "devices" && dashboardData.metrics?.totalDevices}
                {config.metric === "users" && dashboardData.metrics?.totalUsers}
                {config.metric === "assets" && dashboardData.metrics?.totalAssets}
                {config.metric === "notifications" && dashboardData.metrics?.unreadNotifications}
              </div>
              <p className="text-xs text-muted-foreground">
                {config.metric === "devices" && `${dashboardData.metrics?.activeDevices || 0} active`}
                {config.metric === "users" && "Registered users"}
                {config.metric === "assets" && "Digital assets"}
                {config.metric === "notifications" && "Unread notifications"}
              </p>
            </CardContent>
          </Card>
        )

      case "chart-pie":
        const deviceStatusData = dashboardData.devices?.reduce((acc: any, device: any) => {
          acc[device.status] = (acc[device.status] || 0) + 1
          return acc
        }, {})
        const pieData = Object.entries(deviceStatusData || {}).map(([status, count]) => ({
          name: status,
          value: count,
        }))

        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>Current status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )

      case "chart-bar":
        const assetTypeData = dashboardData.assets?.reduce((acc: any, asset: any) => {
          acc[asset.type] = (acc[asset.type] || 0) + 1
          return acc
        }, {})
        const barData = Object.entries(assetTypeData || {}).map(([type, count]) => ({
          name: type,
          count,
        }))

        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>Asset distribution by type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )

      case "recent-activity":
        const recentActivities = [
          { action: "Device added", item: "Server-01", time: "2 minutes ago", type: "success" },
          { action: "User login", item: "john.doe", time: "5 minutes ago", type: "info" },
          { action: "Maintenance completed", item: "Router-03", time: "1 hour ago", type: "success" },
          { action: "Low stock alert", item: "Cat6 Cable", time: "2 hours ago", type: "warning" },
        ]

        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>Latest system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.type === "success"
                            ? "bg-green-500"
                            : activity.type === "warning"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.item}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "quick-actions":
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>Frequently used actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="h-12 bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Device
                </Button>
                <Button variant="outline" size="sm" className="h-12 bg-transparent">
                  <Users className="h-4 w-4 mr-2" />
                  Add User
                </Button>
                <Button variant="outline" size="sm" className="h-12 bg-transparent">
                  <Package className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
                <Button variant="outline" size="sm" className="h-12 bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case "system-health":
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>System performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">CPU Usage</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "45%" }} />
                    </div>
                    <span className="text-sm">45%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Memory Usage</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "72%" }} />
                    </div>
                    <span className="text-sm">72%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Disk Usage</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "58%" }} />
                    </div>
                    <span className="text-sm">58%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Network</span>
                  <Badge variant="outline" className="text-green-600">
                    Online
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "notifications-feed":
        const recentNotifications = dashboardData.notifications?.slice(0, 4) || []
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>Latest notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentNotifications.map((notification: any, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Bell className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{notification.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                    </div>
                    {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      default:
        return (
          <Card className="h-full">
            <CardContent className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Unknown widget type</p>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Customize your dashboard with widgets</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isAddWidgetOpen} onOpenChange={setIsAddWidgetOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Widget</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableWidgets.map((widgetType) => (
                  <Card
                    key={widgetType.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => addWidget(widgetType)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <widgetType.icon className="h-8 w-8 text-blue-500" />
                        <div>
                          <h3 className="font-medium">{widgetType.name}</h3>
                          <p className="text-sm text-muted-foreground">{widgetType.description}</p>
                          <Badge variant="outline" className="mt-1">
                            {widgetType.defaultSize}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
        {widgets
          .filter((widget) => widget.isVisible)
          .map((widget) => (
            <div key={widget.id} className={`relative group ${getGridClass(widget.size)}`}>
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white shadow-sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingWidget(widget)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Move className="h-4 w-4 mr-2" />
                      Resize
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => removeWidget(widget.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {renderWidget(widget)}
            </div>
          ))}
      </div>

      {widgets.filter((w) => w.isVisible).length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No widgets added</h3>
            <p className="text-gray-500 mb-4">Add widgets to customize your dashboard</p>
            <Button onClick={() => setIsAddWidgetOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Widget
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
