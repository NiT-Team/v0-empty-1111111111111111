"use client"

import type { User } from "@/types"

interface SidebarProps {
  currentView: string
  onViewChange: (
    view:
      | "analytics"
      | "devices"
      | "assets"
      | "inventory"
      | "users"
      | "maintenance"
      | "tickets"
      | "contacts"
      | "calendar"
      | "tasks"
      | "ai-chat"
      | "ai-models"
      | "settings"
      | "reports"
      | "audit"
      | "access-rights"
      | "development"
      | "god-mode"
      | "project-materials"
      | "projects",
  ) => void
  isOpen: boolean
  onClose: () => void
  user: User
}

export default function Sidebar({ currentView, onViewChange, isOpen, onClose, user }: SidebarProps) {
  const menuItems = [
    {
      id: "analytics",
      label: "Analytics",
      icon: "fas fa-chart-line",
      roles: ["superuser", "admin", "user"],
      requiredPermission: { module: "devices", action: "view" },
    },
    {
      id: "devices",
      label: "Devices",
      icon: "fas fa-laptop-house",
      roles: ["superuser", "admin", "user"],
      requiredPermission: { module: "devices", action: "view" },
    },
    {
      id: "assets",
      label: "Digital Assets",
      icon: "fas fa-cube",
      roles: ["superuser", "admin", "user"],
      requiredPermission: { module: "assets", action: "view" },
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: "fas fa-boxes",
      roles: ["superuser", "admin", "user"],
      requiredPermission: { module: "inventory", action: "view" },
    },
    {
      id: "projects",
      label: "Projects",
      icon: "fas fa-folder-open",
      roles: ["superuser", "admin", "user"],
      requiredPermission: { module: "inventory", action: "view" },
    },
    {
      id: "project-materials",
      label: "Project Materials",
      icon: "fas fa-project-diagram",
      roles: ["superuser", "admin", "user"],
      requiredPermission: { module: "inventory", action: "view" },
    },
    {
      id: "users",
      label: "Users",
      icon: "fas fa-users",
      roles: ["superuser", "admin"],
      requiredPermission: { module: "users", action: "view" },
    },
    {
      id: "maintenance",
      label: "Maintenance",
      icon: "fas fa-tools",
      roles: ["superuser", "admin", "user"],
      requiredPermission: { module: "maintenance", action: "view" },
    },
    {
      id: "tickets",
      label: "Help Desk",
      icon: "fas fa-ticket-alt",
      roles: ["superuser", "admin", "user", "portal"],
      requiredPermission: { module: "tickets", action: "view" },
    },
    {
      id: "contacts",
      label: "Contacts",
      icon: "fas fa-address-book",
      roles: ["superuser", "admin", "user", "portal"],
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: "fas fa-calendar-alt",
      roles: ["superuser", "admin", "user", "portal"],
    },
    {
      id: "tasks",
      label: "Tasks & Lists",
      icon: "fas fa-tasks",
      roles: ["superuser", "admin", "user", "portal"],
    },
    {
      id: "ai-chat",
      label: "AI Chat",
      icon: "fas fa-robot",
      roles: ["superuser", "admin", "user", "portal"],
      requiredPermission: { module: "aiChat", action: "view" },
    },
    {
      id: "ai-models",
      label: "AI Models",
      icon: "fas fa-brain",
      roles: ["superuser", "admin"],
      requiredPermission: { module: "aiChat", action: "configure" },
    },
    {
      id: "access-rights",
      label: "Access Rights",
      icon: "fas fa-shield-alt",
      roles: ["superuser", "admin"],
    },
    {
      id: "development",
      label: "Dev Tools",
      icon: "fas fa-code",
      roles: ["superuser"],
    },
    {
      id: "god-mode",
      label: "God Mode",
      icon: "fas fa-crown",
      roles: ["superuser"],
    },
    {
      id: "settings",
      label: "Settings",
      icon: "fas fa-cog",
      roles: ["superuser", "admin", "user", "portal"],
      requiredPermission: { module: "settings", action: "view" },
    },
    {
      id: "reports",
      label: "Reports",
      icon: "fas fa-chart-bar",
      roles: ["superuser", "admin", "user"],
      requiredPermission: { module: "reports", action: "view" },
    },
    {
      id: "audit",
      label: "Audit Log",
      icon: "fas fa-history",
      roles: ["superuser", "admin"],
    },
  ]

  const filteredMenuItems = menuItems.filter((item) => {
    // Superuser can access everything
    if (user.role === "superuser") return true

    // Check role access
    if (!item.roles.includes(user.role)) return false

    // Check permission access if specified
    if (item.requiredPermission) {
      const userPermissions = user.permissions || getDefaultPermissions(user.role)
      const modulePerms = userPermissions[item.requiredPermission.module as keyof typeof userPermissions]
      return modulePerms?.[item.requiredPermission.action as keyof typeof modulePerms] || false
    }

    return true
  })

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "superuser":
        return "bg-purple-100 text-purple-800 border border-purple-200"
      case "admin":
        return "bg-red-100 text-red-800 border border-red-200"
      case "portal":
        return "bg-green-100 text-green-800 border border-green-200"
      case "user":
        return "bg-blue-100 text-blue-800 border border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={`
        fixed md:static z-50 bg-white shadow-md h-screen w-64 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <nav className="p-4">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-900 flex items-center justify-between">
              {user.username}
              {user.role === "superuser" && <i className="fas fa-crown text-yellow-500"></i>}
            </div>
            <div className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${getRoleBadgeStyle(user.role)}`}>
              {user.role.toUpperCase()} ACCESS
            </div>
          </div>

          <ul className="space-y-2">
            {filteredMenuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onViewChange(item.id as any)
                    onClose()
                  }}
                  className={`
                    w-full text-left px-4 py-3 rounded-lg font-medium flex items-center transition-colors
                    ${currentView === item.id ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"}
                    ${item.id === "development" ? "border border-red-200" : ""} 
                    ${item.id === "god-mode" ? "border border-yellow-300 bg-yellow-50" : ""}
                    ${item.id === "ai-chat" || item.id === "ai-models" ? "border border-green-200" : ""}
                  `}
                >
                  <i className={`${item.icon} mr-3 ${currentView === item.id ? "text-blue-600" : "text-gray-500"}`}></i>
                  {item.label}
                  {item.id === "development" && (
                    <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-1 rounded">SU</span>
                  )}
                  {item.id === "god-mode" && (
                    <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">👑</span>
                  )}
                  {item.id === "ai-chat" && (
                    <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded">AI</span>
                  )}
                  {item.id === "ai-models" && (
                    <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">CFG</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}

function getDefaultPermissions(role: string) {
  switch (role) {
    case "portal":
      return {
        devices: { view: false, create: false, edit: false, delete: false, export: false },
        assets: { view: false, create: false, edit: false, delete: false, export: false },
        inventory: {
          view: false,
          create: false,
          edit: false,
          delete: false,
          export: false,
          adjustStock: false,
          viewTransactions: false,
          manageAlerts: false,
        },
        users: { view: false, create: false, edit: false, delete: false, manageRoles: false },
        tickets: { view: true, create: true, edit: true, delete: false, assign: false, close: false },
        maintenance: { view: false, create: false, edit: false, delete: false, schedule: false },
        reports: { view: false, create: false, edit: false, delete: false, export: false },
        settings: { view: true, edit: false, system: false, backup: false },
        development: {
          apiAccess: false,
          systemLogs: false,
          databaseAccess: false,
          debugging: false,
          systemMonitoring: false,
        },
        contacts: { view: true, create: false, edit: false, delete: false },
        calendar: { view: true, create: false, edit: false, delete: false },
        tasks: { view: true, create: false, edit: false, delete: false },
        aiChat: { view: true, create: true, edit: false, delete: false, configure: false },
        projects: { view: false, create: false, edit: false, delete: false, manage: false },
      }
    case "admin":
      return {
        devices: { view: true, create: true, edit: true, delete: true, export: true },
        assets: { view: true, create: true, edit: true, delete: true, export: true },
        inventory: {
          view: true,
          create: true,
          edit: true,
          delete: true,
          export: true,
          adjustStock: true,
          viewTransactions: true,
          manageAlerts: true,
        },
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
        contacts: { view: true, create: true, edit: true, delete: true },
        calendar: { view: true, create: true, edit: true, delete: true },
        tasks: { view: true, create: true, edit: true, delete: true },
        aiChat: { view: true, create: true, edit: true, delete: true, configure: true },
        projects: { view: true, create: true, edit: true, delete: true, manage: true },
      }
    default: // regular user
      return {
        devices: { view: true, create: false, edit: false, delete: false, export: false },
        assets: { view: true, create: false, edit: false, delete: false, export: false },
        inventory: {
          view: true,
          create: false,
          edit: false,
          delete: false,
          export: false,
          adjustStock: false,
          viewTransactions: false,
          manageAlerts: false,
        },
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
        contacts: { view: true, create: false, edit: false, delete: false },
        calendar: { view: true, create: false, edit: false, delete: false },
        tasks: { view: true, create: false, edit: false, delete: false },
        aiChat: { view: true, create: true, edit: false, delete: false, configure: false },
        projects: { view: false, create: false, edit: false, delete: false, manage: false },
      }
  }
}
