"use client"

import { useState, useEffect } from "react"
import { Bell, X, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
  id: string
  type: "warning" | "info" | "success"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Generate notifications based on system data
    const generateNotifications = () => {
      const newNotifications: Notification[] = []

      // Check for overdue maintenance tasks
      const maintenanceTasks = JSON.parse(localStorage.getItem("maintenanceTasks") || "[]")
      const overdueTasks = maintenanceTasks.filter((task) => {
        const dueDate = new Date(task.dueDate)
        return dueDate < new Date() && task.status !== "Completed"
      })

      overdueTasks.forEach((task) => {
        newNotifications.push({
          id: `maintenance-${task.id}`,
          type: "warning",
          title: "Overdue Maintenance",
          message: `Maintenance task "${task.title}" is overdue`,
          timestamp: new Date(),
          read: false,
        })
      })

      // Check for devices with inactive status
      const devices = JSON.parse(localStorage.getItem("devices") || "[]")
      const inactiveDevices = devices.filter((device) => device.status === "Inactive")

      if (inactiveDevices.length > 0) {
        newNotifications.push({
          id: "inactive-devices",
          type: "warning",
          title: "Inactive Devices",
          message: `${inactiveDevices.length} devices are currently inactive`,
          timestamp: new Date(),
          read: false,
        })
      }

      // Check for expiring assets
      const assets = JSON.parse(localStorage.getItem("assets") || "[]")
      const expiringAssets = assets.filter((asset) => {
        if (!asset.expiryDate) return false
        const expiryDate = new Date(asset.expiryDate)
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        return expiryDate <= thirtyDaysFromNow && expiryDate > new Date()
      })

      expiringAssets.forEach((asset) => {
        newNotifications.push({
          id: `asset-${asset.id}`,
          type: "info",
          title: "Asset Expiring Soon",
          message: `Asset "${asset.name}" expires on ${new Date(asset.expiryDate).toLocaleDateString()}`,
          timestamp: new Date(),
          read: false,
        })
      })

      setNotifications(newNotifications)
    }

    generateNotifications()

    // Refresh notifications every 5 minutes
    const interval = setInterval(generateNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="relative">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">{unreadCount}</Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b hover:bg-muted/50 cursor-pointer ${
                        !notification.read ? "bg-muted/30" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2 flex-1">
                          {getIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            dismissNotification(notification.id)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
