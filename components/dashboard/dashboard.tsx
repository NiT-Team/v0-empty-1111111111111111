"use client"

import { useState, useEffect } from "react"
import Header from "./header"
import Sidebar from "./sidebar"
import AnalyticsDashboard from "./analytics-dashboard"
import DevicesView from "./devices-view"
import AssetsView from "./assets-view"
import InventoryView from "./inventory-view"
import UsersView from "./users-view"
import MaintenanceView from "./maintenance-view"
import TicketsView from "./tickets-view"
import SettingsView from "./settings-view"
import ReportsView from "./reports-view"
import AuditLog from "./audit-log"
import AccessRightsView from "./access-rights-view"
import DevelopmentTools from "./development-tools"
import GodModePanel from "./god-mode-panel"
import ContactsView from "./contacts-view"
import CalendarView from "./calendar-view"
import TasksView from "./tasks-view"
import AppFooter from "@/components/ui/app-footer"
import { usePermissions } from "@/hooks/use-permissions"
import AIChatView from "./ai-chat-view" // Import AIChatView
import AIModelsView from "./ai-models-view" // Import AIModelsView
import ProjectMaterialsView from "./project-materials-view"
import ProjectsView from "./projects-view" // Import ProjectsView component
import type {
  User,
  Device,
  Asset,
  MaintenanceTask,
  InventoryItem,
  ContactInfo,
  CalendarEvent,
  Task,
  TodoList,
  AIChatSession,
  AIModel,
  AIProvider,
  Project,
  ProjectMaterial,
} from "@/types"

interface DashboardProps {
  user: User
  onLogout: () => void
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<
    | "analytics"
    | "devices"
    | "assets"
    | "inventory"
    | "users"
    | "maintenance"
    | "tickets"
    | "settings"
    | "reports"
    | "audit"
    | "access-rights"
    | "development"
    | "god-mode"
    | "contacts"
    | "calendar"
    | "tasks"
    | "ai-chat"
    | "ai-models"
    | "project-materials"
    | "projects" // Add projects to the view type union
  >("analytics")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [devices, setDevices] = useState<Device[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([])
  const [contacts, setContacts] = useState<ContactInfo[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [todoLists, setTodoLists] = useState<TodoList[]>([])
  const [chatSessions, setChatSessions] = useState<AIChatSession[]>([])
  const [aiModels, setAIModels] = useState<AIModel[]>([])
  const [aiProviders, setAIProviders] = useState<AIProvider[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [projectMaterials, setProjectMaterials] = useState<ProjectMaterial[]>([])

  const { canAccessView } = usePermissions(user)

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const superuserExists = users.find((u: User) => u.username === "infonit")

    if (!superuserExists) {
      const superuser = {
        id: Date.now(),
        username: "infonit",
        password: "admininfonit",
        role: "superuser",
        uniqueCode: "SU-001",
        devices: [],
        assets: [],
        profile: {
          firstName: "System",
          lastName: "Administrator",
          email: "admin@infonit.com",
          phone: "+1-555-0000",
          department: "IT",
          position: "System Administrator",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        permissions: {
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
        },
        isActive: true,
        createdAt: new Date().toISOString(),
      }
      users.push(superuser)
      localStorage.setItem("users", JSON.stringify(users))
    }

    if (users.length === 1) {
      const defaultUsers = [
        {
          id: 1,
          username: "admin",
          password: "admin123",
          role: "admin",
          uniqueCode: "USR-001",
          devices: [],
          assets: [],
        },
      ]
      localStorage.setItem("users", JSON.stringify([...users, ...defaultUsers]))
    }

    const currentUserData = users.find((u: User) => u.id === user.id)
    if (currentUserData) {
      setDevices(currentUserData.devices || [])
      setAssets(currentUserData.assets || [])
    }

    const storedInventory = localStorage.getItem("infonit_inventory")
    if (storedInventory) {
      setInventoryItems(JSON.parse(storedInventory))
    } else {
      const sampleInventory: InventoryItem[] = [
        {
          id: 1,
          name: "HP Toner Cartridge",
          description: "Black toner cartridge for HP LaserJet printers",
          category: "consumables",
          sku: "HP-Q7516A",
          partNumber: "Q7516A",
          quantity: 15,
          minQuantity: 5,
          unitCost: 89.99,
          totalValue: 1349.85,
          supplier: "HP Direct",
          location: "Storage Room A",
          status: "in-stock",
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          updatedBy: "system",
        },
        {
          id: 2,
          name: "Network Cable Cat6",
          description: "Ethernet cable Cat6 - 3ft",
          category: "spare-parts",
          sku: "CAT6-3FT",
          quantity: 2,
          minQuantity: 10,
          unitCost: 12.5,
          totalValue: 25.0,
          supplier: "TechSupply Co",
          location: "Storage Room B",
          status: "low-stock",
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          updatedBy: "system",
        },
      ]
      setInventoryItems(sampleInventory)
      localStorage.setItem("infonit_inventory", JSON.stringify(sampleInventory))
    }

    const storedContacts = localStorage.getItem("infonit_contacts")
    if (storedContacts) {
      setContacts(JSON.parse(storedContacts))
    } else {
      const sampleContacts: ContactInfo[] = [
        {
          id: 1,
          firstName: "John",
          lastName: "Smith",
          company: "TechCorp Inc.",
          jobTitle: "IT Manager",
          email: "john.smith@techcorp.com",
          phone: "+1-555-0123",
          category: "client",
          status: "active",
          priority: "high",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "system",
        },
        {
          id: 2,
          firstName: "Sarah",
          lastName: "Johnson",
          company: "Hardware Solutions",
          jobTitle: "Sales Representative",
          email: "sarah.j@hardwaresolutions.com",
          phone: "+1-555-0456",
          category: "vendor",
          status: "active",
          priority: "medium",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "system",
        },
      ]
      setContacts(sampleContacts)
      localStorage.setItem("infonit_contacts", JSON.stringify(sampleContacts))
    }

    const storedEvents = localStorage.getItem("infonit_events")
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents))
    } else {
      const sampleEvents: CalendarEvent[] = [
        {
          id: "event_1",
          title: "Server Maintenance",
          description: "Scheduled maintenance for main server",
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          allDay: false,
          type: "maintenance",
          priority: "high",
          status: "scheduled",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "system",
        },
        {
          id: "event_2",
          title: "Team Meeting",
          description: "Weekly team sync meeting",
          startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
          allDay: false,
          type: "meeting",
          priority: "medium",
          status: "scheduled",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "system",
        },
      ]
      setEvents(sampleEvents)
      localStorage.setItem("infonit_events", JSON.stringify(sampleEvents))
    }

    const storedTasks = localStorage.getItem("infonit_tasks")
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks))
    } else {
      const sampleTasks: Task[] = [
        {
          id: "task_1",
          title: "Update firewall rules",
          description: "Review and update firewall configuration",
          status: "todo",
          priority: "high",
          category: "maintenance",
          progress: 0,
          createdBy: "system",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "task_2",
          title: "Backup verification",
          description: "Verify last week's backup integrity",
          status: "in-progress",
          priority: "medium",
          category: "administrative",
          progress: 50,
          createdBy: "system",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      setTasks(sampleTasks)
      localStorage.setItem("infonit_tasks", JSON.stringify(sampleTasks))
    }

    const storedTodoLists = localStorage.getItem("infonit_todo_lists")
    if (storedTodoLists) {
      setTodoLists(JSON.parse(storedTodoLists))
    } else {
      const defaultTodoList: TodoList[] = [
        {
          id: "list_default",
          name: "General Tasks",
          description: "Default task list for general items",
          color: "#3B82F6",
          isDefault: true,
          tasks: ["task_1", "task_2"],
          createdBy: "system",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      setTodoLists(defaultTodoList)
      localStorage.setItem("infonit_todo_lists", JSON.stringify(defaultTodoList))
    }

    const storedChatSessions = localStorage.getItem("infonit_ai_chats")
    if (storedChatSessions) {
      setChatSessions(JSON.parse(storedChatSessions))
    }

    const storedAIModels = localStorage.getItem("infonit_ai_models")
    if (storedAIModels) {
      setAIModels(JSON.parse(storedAIModels))
    } else {
      const defaultModels: AIModel[] = [
        {
          id: "gpt-4o",
          name: "GPT-4o",
          modelId: "gpt-4o",
          provider: "openai",
          description: "Most advanced GPT-4 model with improved reasoning",
          maxTokens: 128000,
          costPer1kTokens: 0.005,
          isActive: false,
          requiresApiKey: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "gpt-3.5-turbo",
          name: "GPT-3.5 Turbo",
          modelId: "gpt-3.5-turbo",
          provider: "openai",
          description: "Fast and efficient model for most tasks",
          maxTokens: 16385,
          costPer1kTokens: 0.001,
          isActive: false,
          requiresApiKey: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      setAIModels(defaultModels)
      localStorage.setItem("infonit_ai_models", JSON.stringify(defaultModels))
    }

    const storedAIProviders = localStorage.getItem("infonit_ai_providers")
    if (storedAIProviders) {
      setAIProviders(JSON.parse(storedAIProviders))
    } else {
      const defaultProviders: AIProvider[] = [
        {
          id: "openai",
          name: "OpenAI",
          status: "inactive",
          models: ["gpt-4o", "gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"],
          isConfigured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "anthropic",
          name: "Anthropic",
          status: "inactive",
          models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
          isConfigured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      setAIProviders(defaultProviders)
      localStorage.setItem("infonit_ai_providers", JSON.stringify(defaultProviders))
    }

    const storedProjects = localStorage.getItem("infonit_projects")
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects))
    } else {
      const sampleProjects: Project[] = [
        {
          id: "project_1",
          name: "Network Infrastructure Upgrade",
          description: "Upgrade network infrastructure for better performance",
          status: "active",
          priority: "high",
          startDate: new Date().toISOString(),
          assignedUsers: ["1"],
          devices: [],
          assets: [],
          tickets: [],
          progress: 25,
          budget: 50000,
          actualCost: 12500,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "system",
        },
        {
          id: "project_2",
          name: "Security System Implementation",
          description: "Implement comprehensive security monitoring system",
          status: "active",
          priority: "medium",
          startDate: new Date().toISOString(),
          assignedUsers: ["1"],
          devices: [],
          assets: [],
          tickets: [],
          progress: 60,
          budget: 30000,
          actualCost: 18000,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "system",
        },
      ]
      setProjects(sampleProjects)
      localStorage.setItem("infonit_projects", JSON.stringify(sampleProjects))
    }

    const storedProjectMaterials = localStorage.getItem("infonit_project_materials")
    if (storedProjectMaterials) {
      setProjectMaterials(JSON.parse(storedProjectMaterials))
    } else {
      const sampleMaterials: ProjectMaterial[] = [
        {
          id: "material_1",
          name: "Cisco Switch 24-Port",
          description: "24-port managed Ethernet switch",
          category: "hardware",
          projectId: "project_1",
          quantity: 2,
          unit: "pcs",
          unitCost: 450,
          totalCost: 900,
          supplier: "Cisco Systems",
          status: "delivered",
          location: "Storage Room A",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "system",
        },
        {
          id: "material_2",
          name: "Cat6 Ethernet Cables",
          description: "Category 6 Ethernet cables - 50ft",
          category: "consumables",
          projectId: "project_1",
          quantity: 20,
          unit: "pcs",
          unitCost: 25,
          totalCost: 500,
          supplier: "Cable Solutions Inc",
          status: "in-use",
          location: "Installation Site",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "system",
        },
      ]
      setProjectMaterials(sampleMaterials)
      localStorage.setItem("infonit_project_materials", JSON.stringify(sampleMaterials))
    }
  }, [user.id])

  const renderCurrentView = () => {
    if (!canAccessView(currentView)) {
      return (
        <div className="text-center py-12">
          <i className="fas fa-lock text-gray-400 text-6xl mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to access this section.</p>
        </div>
      )
    }

    switch (currentView) {
      case "analytics":
        return <AnalyticsDashboard />
      case "devices":
        return <DevicesView devices={devices} setDevices={setDevices} user={user} />
      case "assets":
        return <AssetsView assets={assets} setAssets={setAssets} user={user} />
      case "inventory":
        return <InventoryView inventoryItems={inventoryItems} setInventoryItems={setInventoryItems} user={user} />
      case "users":
        return <UsersView currentUser={user} />
      case "maintenance":
        return <MaintenanceView tasks={maintenanceTasks} setTasks={setMaintenanceTasks} devices={devices} />
      case "tickets":
        return <TicketsView onViewChange={setCurrentView} />
      case "contacts":
        return <ContactsView contacts={contacts} setContacts={setContacts} user={user} />
      case "calendar":
        return <CalendarView events={events} setEvents={setEvents} user={user} />
      case "tasks":
        return (
          <TasksView tasks={tasks} setTasks={setTasks} todoLists={todoLists} setTodoLists={setTodoLists} user={user} />
        )
      case "ai-chat":
        return (
          <AIChatView chatSessions={chatSessions} setChatSessions={setChatSessions} aiModels={aiModels} user={user} />
        )
      case "ai-models":
        return (
          <AIModelsView
            aiModels={aiModels}
            setAIModels={setAIModels}
            aiProviders={aiProviders}
            setAIProviders={setAIProviders}
            user={user}
          />
        )
      case "project-materials":
        return <ProjectMaterialsView projects={projects} user={user} />
      case "projects": // Add projects case to render ProjectsView
        return <ProjectsView user={user} />
      case "access-rights":
        return <AccessRightsView currentUser={user} />
      case "development":
        return <DevelopmentTools currentUser={user} />
      case "god-mode":
        return <GodModePanel currentUser={user} />
      case "settings":
        return <SettingsView user={user} />
      case "reports":
        return <ReportsView devices={devices} assets={assets} tasks={maintenanceTasks} />
      case "audit":
        return <AuditLog />
      default:
        return <AnalyticsDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} onLogout={onLogout} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
        />

        <main className="flex-1 flex flex-col ml-0 md:ml-64 transition-all duration-300">
          <div className="flex-1 p-6">{renderCurrentView()}</div>
          <AppFooter />
        </main>
      </div>
    </div>
  )
}
