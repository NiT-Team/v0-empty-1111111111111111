"use client"

import type { ReactNode } from "react"
import type { User } from "@/types"
import { usePermissions } from "@/hooks/use-permissions"

interface AccessGuardProps {
  user: User
  requiredRole?: string[]
  requiredPermission?: {
    module: string
    action: string
  }
  fallback?: ReactNode
  children: ReactNode
}

export default function AccessGuard({
  user,
  requiredRole,
  requiredPermission,
  fallback = (
    <div className="text-center py-8">
      <i className="fas fa-lock text-gray-400 text-4xl mb-4"></i>
      <h3 className="text-lg font-semibold text-gray-600 mb-2">Access Denied</h3>
      <p className="text-gray-500">You don't have permission to access this feature.</p>
    </div>
  ),
  children,
}: AccessGuardProps) {
  const { hasPermission, isSuperuser } = usePermissions(user)

  // Superuser bypasses all restrictions
  if (isSuperuser) {
    return <>{children}</>
  }

  // Check role-based access
  if (requiredRole && !requiredRole.includes(user.role)) {
    return <>{fallback}</>
  }

  // Check permission-based access
  if (requiredPermission) {
    const { module, action } = requiredPermission
    if (!hasPermission(module as any, action)) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}
