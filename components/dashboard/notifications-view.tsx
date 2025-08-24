"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Bell,
  Search,
  Filter,
  CheckCheck,
  Trash2,
  Settings,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Wrench,
  Package,
  Shield,
  MoreHorizontal,
  Eye,
  EyeOff,
} from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success" | "maintenance" | "inventory" | "security" | "user"
  priority: "low" | "medium" | "high" | "critical"
  isRead: boolean
  createdAt: Date
  category: string
  actionUrl?: string
  metadata?: {
    deviceId?: string
    assetId?: string
    userId?: string
    ticketId?: string
    projectId?: string
  }
}

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  useEffect(() => {
    // Load notifications from localStorage or generate sample data
    const storedNotifications = localStorage.getItem("infonit_notifications")
    if (storedNotifications) {
      const parsed = JSON.parse(storedNotifications)
      setNotifications(parsed.map((n: any) => ({ ...n, createdAt: new Date(n.createdAt) })))
    } else {
      const sampleNotifications: Notification[] = [
        {
          id: "notif_1",
          title: "System Maintenance Scheduled",
          message: "Server maintenance is scheduled for tonight at 2:00 AM. Expected downtime: 2 hours.",
          type: "maintenance",
          priority: "high",
          isRead: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
          category: "System",
          actionUrl: "/maintenance",
        },
        {
          id: "notif_2",
          title: "Low Inventory Alert",
          message: "Network Cable Cat6 stock is running low (2 units remaining). Minimum threshold: 10 units.",
          type: "inventory",
          priority: "medium",
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          category: "Inventory",
          actionUrl: "/inventory",
          metadata: { assetId: "cat6-cable" },
        },
        {
          id: "notif_3",
          title: "Security Alert",
          message: "Multiple failed login attempts detected from IP 192.168.1.100.",
          type: "security",
          priority: "critical",
          isRead: true,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          category: "Security",
          actionUrl: "/audit",
        },
        {
          id: "notif_4",
          title: "New User Registration",
          message: "John Smith has registered for portal access and is awaiting approval.",
          type: "user",
          priority: "medium",
          isRead: false,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          category: "User Management",
          actionUrl: "/users",
          metadata: { userId: "john_smith" },
        },
        {
          id: "notif_5",
          title: "Backup Completed Successfully",
          message: "Daily system backup completed successfully. Size: 2.4 GB.",
          type: "success",
          priority: "low",
          isRead: true,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          category: "System",
        },
        {
          id: "notif_6",
          title: "Device Offline",
          message: "Server-01 has been offline for 15 minutes. Last seen: 3:45 PM.",
          type: "error",
          priority: "high",
          isRead: false,
          createdAt: new Date(Date.now() - 15 * 60 * 1000),
          category: "Devices",
          actionUrl: "/devices",
          metadata: { deviceId: "server-01" },
        },
      ]
      setNotifications(sampleNotifications)
      localStorage.setItem("infonit_notifications", JSON.stringify(sampleNotifications))
    }
  }, [])

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === "all" || notification.type === selectedType
    const matchesPriority = selectedPriority === "all" || notification.priority === selectedPriority
    const matchesReadStatus = !showUnreadOnly || !notification.isRead

    return matchesSearch && matchesType && matchesPriority && matchesReadStatus
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const criticalCount = notifications.filter((n) => n.priority === "critical" && !n.isRead).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "maintenance":
        return <Wrench className="h-5 w-5 text-orange-500" />
      case "inventory":
        return <Package className="h-5 w-5 text-purple-500" />
      case "security":
        return <Shield className="h-5 w-5 text-red-600" />
      case "user":
        return <User className="h-5 w-5 text-blue-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return (
          <Badge variant="destructive" className="text-xs">
            Critical
          </Badge>
        )
      case "high":
        return (
          <Badge variant="destructive" className="text-xs bg-orange-500">
            High
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="secondary" className="text-xs bg-yellow-500 text-white">
            Medium
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="text-xs">
            Low
          </Badge>
        )
      default:
        return null
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      localStorage.setItem("infonit_notifications", JSON.stringify(updated))
      return updated
    })
  }

  const markAsUnread = (notificationId: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === notificationId ? { ...n, isRead: false } : n))
      localStorage.setItem("infonit_notifications", JSON.stringify(updated))
      return updated
    })
  }

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }))
      localStorage.setItem("infonit_notifications", JSON.stringify(updated))
      return updated
    })
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== notificationId)
      localStorage.setItem("infonit_notifications", JSON.stringify(updated))
      return updated
    })
  }

  const clearAllRead = () => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => !n.isRead)
      localStorage.setItem("infonit_notifications", JSON.stringify(updated))
      return updated
    })
  }

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <Card
      className={`transition-all hover:shadow-md ${!notification.isRead ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {getNotificationIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`text-sm font-medium ${!notification.isRead ? "text-gray-900" : "text-gray-600"}`}>
                  {notification.title}
                </h3>
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(notification.priority)}
                  {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(notification.createdAt)}</span>
                  <Badge variant="outline" className="text-xs">
                    {notification.category}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {notification.isRead ? (
                <DropdownMenuItem onClick={() => markAsUnread(notification.id)}>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Mark as Unread
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Mark as Read
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-red-600" onClick={() => deleteNotification(notification.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications Center</h1>
          <p className="text-gray-600">Stay updated with system alerts and important updates</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" onClick={clearAllRead}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Read
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Notification Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Email Notifications</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Critical alerts</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Security notifications</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">Maintenance reminders</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Settings</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    notifications.filter((n) => {
                      const today = new Date()
                      const notifDate = new Date(n.createdAt)
                      return notifDate.toDateString() === today.toDateString()
                    }).length
                  }
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Type: {selectedType === "all" ? "All" : selectedType}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedType("all")}>All Types</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType("critical")}>Critical</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType("security")}>Security</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType("maintenance")}>Maintenance</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType("inventory")}>Inventory</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType("user")}>User</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Priority: {selectedPriority === "all" ? "All" : selectedPriority}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedPriority("all")}>All Priorities</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPriority("critical")}>Critical</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPriority("high")}>High</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPriority("medium")}>Medium</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPriority("low")}>Low</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant={showUnreadOnly ? "default" : "outline"} onClick={() => setShowUnreadOnly(!showUnreadOnly)}>
            {showUnreadOnly ? "Show All" : "Unread Only"}
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No notifications found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))
        )}
      </div>
    </div>
  )
}
