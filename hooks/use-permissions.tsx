"use client"

import { useMemo } from "react"
import type { User, UserPermissions } from "@/types"

export function usePermissions(user: User) {
  const permissions = useMemo(() => {
    // Superuser has all permissions - cannot be overridden
    if (user.role === "superuser") {
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
        users: { view: true, create: true, edit: true, delete: true, manageRoles: true },
        tickets: { view: true, create: true, edit: true, delete: true, assign: true, close: true },
        maintenance: { view: true, create: true, edit: true, delete: true, schedule: true },
        reports: { view: true, create: true, edit: true, delete: true, export: true },
        settings: { view: true, edit: true, system: true, backup: true },
        development: {
          apiAccess: true,
          systemLogs: true,
          databaseAccess: true,
          debugging: true,
          systemMonitoring: true,
        },
      }
    }

    // Use custom permissions if available, otherwise use role defaults
    return user.permissions || getDefaultPermissions(user.role)
  }, [user])

  const hasPermission = (module: keyof UserPermissions, action: string): boolean => {
    return permissions[module]?.[action as keyof (typeof permissions)[typeof module]] || false
  }

  const canAccessView = (view: string): boolean => {
    // Superuser can access everything
    if (user.role === "superuser") return true

    switch (view) {
      case "analytics":
        return hasPermission("devices", "view") || hasPermission("assets", "view") || hasPermission("inventory", "view")
      case "devices":
        return hasPermission("devices", "view")
      case "assets":
        return hasPermission("assets", "view")
      case "inventory":
        return hasPermission("inventory", "view")
      case "users":
        return hasPermission("users", "view")
      case "maintenance":
        return hasPermission("maintenance", "view")
      case "tickets":
        return hasPermission("tickets", "view")
      case "contacts":
        return true // All users can access contacts
      case "calendar":
        return true // All users can access calendar
      case "tasks":
        return true // All users can access task management
      case "access-rights":
        return user.role === "admin" || user.role === "superuser"
      case "development":
        return user.role === "superuser"
      case "god-mode":
        return user.role === "superuser"
      case "settings":
        return hasPermission("settings", "view")
      case "reports":
        return hasPermission("reports", "view")
      case "audit":
        return user.role === "admin" || user.role === "superuser"
      default:
        return false
    }
  }

  return {
    permissions,
    hasPermission,
    canAccessView,
    isSuperuser: user.role === "superuser",
    isAdmin: user.role === "admin" || user.role === "superuser",
    isPortalUser: user.role === "portal",
  }
}

function getDefaultPermissions(role: string): UserPermissions {
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
      }
  }
}
