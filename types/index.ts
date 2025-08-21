export interface User {
  id: number
  username: string
  password: string
  role: "superuser" | "admin" | "portal" | "user"
  uniqueCode: string
  devices: Device[]
  assets: Asset[]
  profile?: UserProfile
  permissions?: UserPermissions
  lastLogin?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  loginAttempts?: number
  lockoutUntil?: string
}

export interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  position: string
  avatar?: string
  bio?: string
  createdAt: string
  updatedAt: string
  timezone?: string
  language?: string
  theme?: "light" | "dark" | "auto"
  notifications?: NotificationSettings
}

export interface NotificationSettings {
  email: boolean
  browser: boolean
  maintenance: boolean
  tickets: boolean
  system: boolean
}

export interface UserPermissions {
  devices: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    export: boolean
  }
  assets: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    export: boolean
  }
  users: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    manageRoles: boolean
  }
  tickets: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    assign: boolean
    close: boolean
  }
  maintenance: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    schedule: boolean
  }
  reports: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    export: boolean
  }
  settings: {
    view: boolean
    edit: boolean
    system: boolean
    backup: boolean
  }
  development: {
    apiAccess: boolean
    systemLogs: boolean
    databaseAccess: boolean
    debugging: boolean
    systemMonitoring: boolean
  }
  inventory: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    export: boolean
    adjustStock: boolean
    viewTransactions: boolean
    manageAlerts: boolean
  }
}

export interface Device {
  id: number
  name: string
  model: string
  ip: string
  mac: string
  type: string
  status: string
  category: string
  location: string
  username?: string
  password?: string
  port?: number
  url?: string
  access?: string
  primaryContacts?: Contact[]
  secondaryContacts?: Contact[]
  notes?: string
  purchaseDate?: string
  warrantyExpiry?: string
  vendor?: string
  serial?: string
  lastMaintenance?: string
  nextMaintenance?: string
  maintenanceInterval?: number
  maintenanceStatus?: string
  maintenanceNotes?: string
  spareParts?: SparePart[]
  lastUpdated?: string
}

export interface Asset {
  id: number
  name: string
  type: string
  vendor: string
  status: string
  category: string
  location: string
  licenseKey?: string
  expiryDate?: string
  purchaseDate?: string
  cost?: number
  notes?: string
}

export interface Contact {
  name: string
  role: string
  email: string
  phone: string
}

export interface SparePart {
  id: number
  name: string
  partNumber: string
  quantity: number
  supplier: string
}

export interface InventoryItem {
  id: number
  name: string
  description?: string
  category: "spare-parts" | "consumables" | "tools" | "equipment" | "software" | "other"
  sku?: string
  partNumber?: string
  barcode?: string
  quantity: number
  minQuantity?: number
  maxQuantity?: number
  unitCost?: number
  totalValue?: number
  supplier?: string
  location?: string
  status: "in-stock" | "low-stock" | "out-of-stock" | "discontinued" | "on-order"
  purchaseDate?: string
  expiryDate?: string
  warrantyExpiry?: string
  notes?: string
  tags?: string[]
  lastUpdated?: string
  createdAt?: string
  updatedBy?: string
  associatedDevices?: number[]
  associatedAssets?: number[]
  reorderLevel?: number
  reorderQuantity?: number
  vendor?: string
  model?: string
  serialNumbers?: string[]
}

export interface InventoryTransaction {
  id: number
  itemId: number
  type: "in" | "out" | "adjustment" | "transfer"
  quantity: number
  reason: string
  reference?: string
  userId: string
  timestamp: string
  fromLocation?: string
  toLocation?: string
  cost?: number
  notes?: string
}

export interface InventoryAlert {
  id: number
  itemId: number
  type: "low-stock" | "out-of-stock" | "expiry-warning" | "reorder-point"
  message: string
  severity: "low" | "medium" | "high" | "critical"
  isRead: boolean
  createdAt: string
  resolvedAt?: string
}

export interface MaintenanceTask {
  id: number
  title: string
  description: string
  deviceId: number
  deviceName: string
  priority: "Low" | "Medium" | "High"
  status: "Scheduled" | "In Progress" | "Completed" | "Overdue"
  dueDate: string
  assignedTo?: string
  estimatedDuration?: number
  actualDuration?: number
  spareParts?: SparePart[]
  completedDate?: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  type: "hardware" | "software" | "network" | "access" | "other"
  priority: "low" | "medium" | "high" | "critical"
  status: "open" | "in-progress" | "pending" | "resolved" | "closed"
  reportedBy: string
  assignedTo?: string
  deviceId?: string
  assetId?: string
  resolution?: string
  tags: string[]
  attachments: Attachment[]
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

export interface Attachment {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
  uploadedBy: string
}

export interface SystemLog {
  id: string
  timestamp: string
  level: "info" | "warning" | "error" | "debug"
  module: string
  action: string
  userId?: string
  details: string
  ipAddress?: string
}

export interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  totalDevices: number
  activeDevices: number
  totalAssets: number
  openTickets: number
  pendingMaintenance: number
  systemUptime: string
  lastBackup?: string
  totalInventoryItems?: number
  lowStockItems?: number
  outOfStockItems?: number
  totalInventoryValue?: number
}

export interface Project {
  id: string
  name: string
  description: string
  status: "active" | "inactive" | "completed" | "on-hold"
  priority: "low" | "medium" | "high" | "critical"
  startDate: string
  endDate?: string
  assignedUsers: string[]
  devices: string[]
  assets: string[]
  tickets: string[]
  progress: number
  budget?: number
  actualCost?: number
  createdAt: string
  updatedAt: string
  createdBy: string
  tags?: string[]
  attachments?: Attachment[]
}

export interface ContactInfo {
  id: number
  firstName: string
  lastName: string
  company?: string
  jobTitle?: string
  department?: string
  email: string
  phone: string
  mobile?: string
  address?: ContactAddress
  website?: string
  notes?: string
  tags?: string[]
  category: "client" | "vendor" | "employee" | "contractor" | "partner" | "other"
  status: "active" | "inactive" | "archived"
  priority: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
  createdBy: string
  lastContactDate?: string
  nextFollowUp?: string
  socialMedia?: SocialMediaLinks
  customFields?: Record<string, any>
  relatedContacts?: number[]
  associatedProjects?: string[]
  associatedDevices?: number[]
  associatedAssets?: number[]
}

export interface ContactAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface SocialMediaLinks {
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  allDay: boolean
  location?: string
  attendees?: string[]
  contactIds?: number[]
  type: "meeting" | "maintenance" | "deadline" | "reminder" | "personal" | "other"
  priority: "low" | "medium" | "high" | "critical"
  status: "scheduled" | "confirmed" | "cancelled" | "completed"
  recurrence?: RecurrenceRule
  reminders?: EventReminder[]
  attachments?: Attachment[]
  createdAt: string
  updatedAt: string
  createdBy: string
  color?: string
  isPrivate?: boolean
  relatedTickets?: string[]
  relatedProjects?: string[]
  relatedDevices?: number[]
}

export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  interval: number
  endDate?: string
  count?: number
  daysOfWeek?: number[]
  dayOfMonth?: number
  monthOfYear?: number
}

export interface EventReminder {
  type: "email" | "notification" | "sms"
  minutesBefore: number
}

export interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "in-progress" | "completed" | "cancelled" | "on-hold"
  priority: "low" | "medium" | "high" | "critical"
  dueDate?: string
  startDate?: string
  completedDate?: string
  assignedTo?: string
  createdBy: string
  estimatedHours?: number
  actualHours?: number
  progress: number
  tags?: string[]
  category: "general" | "maintenance" | "project" | "support" | "administrative" | "personal"
  parentTaskId?: string
  subtasks?: string[]
  dependencies?: string[]
  attachments?: Attachment[]
  comments?: TaskComment[]
  relatedContacts?: number[]
  relatedProjects?: string[]
  relatedTickets?: string[]
  relatedDevices?: number[]
  relatedAssets?: number[]
  createdAt: string
  updatedAt: string
  isRecurring?: boolean
  recurrence?: RecurrenceRule
}

export interface TaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: string
  updatedAt?: string
}

export interface TodoList {
  id: string
  name: string
  description?: string
  color?: string
  isDefault: boolean
  tasks: string[]
  createdBy: string
  sharedWith?: string[]
  createdAt: string
  updatedAt: string
}

export interface AIModel {
  id: string
  name: string
  provider: "openai" | "anthropic" | "google" | "custom"
  modelId: string
  description?: string
  maxTokens: number
  costPer1kTokens?: number
  capabilities: string[]
  isActive: boolean
  apiEndpoint?: string
  requiresApiKey: boolean
  parameters?: AIModelParameters
}

export interface AIModelParameters {
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  systemPrompt?: string
}

export interface AIChatSession {
  id: string
  title: string
  modelId: string
  userId: string
  messages: AIChatMessage[]
  createdAt: string
  updatedAt: string
  isActive: boolean
  totalTokens?: number
  totalCost?: number
  settings?: AIChatSettings
  tags?: string[]
  isShared?: boolean
  sharedWith?: string[]
}

export interface AIChatMessage {
  id: string
  sessionId: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
  tokens?: number
  cost?: number
  attachments?: Attachment[]
  isEdited?: boolean
  editedAt?: string
  parentMessageId?: string
}

export interface AIChatSettings {
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  systemPrompt?: string
  autoSave: boolean
  showTokenCount: boolean
  showCost: boolean
}

export interface AIProvider {
  id: string
  name: string
  apiKeyRequired: boolean
  baseUrl?: string
  models: AIModel[]
  isConfigured: boolean
  lastTested?: string
  status: "active" | "inactive" | "error"
}

export interface AIConfiguration {
  providers: AIProvider[]
  defaultModelId?: string
  globalSettings: {
    maxSessionsPerUser: number
    maxMessagesPerSession: number
    autoDeleteOldSessions: boolean
    sessionRetentionDays: number
    enableCostTracking: boolean
    enableUsageAnalytics: boolean
  }
  apiKeys: Record<string, string>
}

export interface ProjectMaterial {
  id: string
  name: string
  description?: string
  category: "hardware" | "software" | "consumables" | "tools" | "equipment" | "materials"
  projectId: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  supplier?: string
  status: "available" | "ordered" | "delivered" | "in-use" | "consumed" | "returned"
  minQuantity?: number
  location?: string
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  purchaseDate?: string
  deliveryDate?: string
  warrantyExpiry?: string
  tags?: string[]
  attachments?: Attachment[]
}
