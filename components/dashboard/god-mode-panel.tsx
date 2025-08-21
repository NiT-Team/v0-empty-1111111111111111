"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import UserFormModal from "@/components/forms/user-form-modal"
import TicketFormModal from "@/components/forms/ticket-form-modal"
import type { User, Ticket, Project, Device, Asset } from "@/types"
import { Crown, Trash2, Edit, Plus, Shield, Database } from "lucide-react"

interface GodModePanelProps {
  currentUser: any
}

export default function GodModePanel({ currentUser }: GodModePanelProps) {
  const [users, setUsers] = useState<User[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = () => {
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")
    setUsers(storedUsers)

    const storedTickets = JSON.parse(localStorage.getItem("tickets") || "[]")
    setTickets(storedTickets)

    const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]")
    setProjects(storedProjects)

    const storedDevices = JSON.parse(localStorage.getItem("devices") || "[]")
    setDevices(storedDevices)

    const storedAssets = JSON.parse(localStorage.getItem("assets") || "[]")
    setAssets(storedAssets)
  }

  const handleSaveUser = (userData: User) => {
    const updatedUsers = selectedUser
      ? users.map((user) => (user.id === selectedUser.id ? userData : user))
      : [...users, userData]
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
    setSelectedUser(null)
  }

  const handleSaveTicket = (ticketData: Omit<Ticket, "id" | "createdAt" | "updatedAt">) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: selectedTicket?.id || Date.now().toString(),
      createdAt: selectedTicket?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedTickets = selectedTicket
      ? tickets.map((ticket) => (ticket.id === selectedTicket.id ? newTicket : ticket))
      : [...tickets, newTicket]
    setTickets(updatedTickets)
    localStorage.setItem("tickets", JSON.stringify(updatedTickets))
    setSelectedTicket(null)
  }

  const deleteUser = (userId: string) => {
    const updatedUsers = users.filter((user) => user.id !== userId)
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
  }

  const deleteTicket = (ticketId: string) => {
    const updatedTickets = tickets.filter((ticket) => ticket.id !== ticketId)
    setTickets(updatedTickets)
    localStorage.setItem("tickets", JSON.stringify(updatedTickets))
  }

  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter((project) => project.id !== projectId)
    setProjects(updatedProjects)
    localStorage.setItem("projects", JSON.stringify(updatedProjects))
  }

  const createProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: "New Project",
      description: "Project description",
      status: "active",
      priority: "medium",
      startDate: new Date().toISOString(),
      assignedUsers: [],
      devices: [],
      assets: [],
      tickets: [],
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser.id,
    }
    const updatedProjects = [...projects, newProject]
    setProjects(updatedProjects)
    localStorage.setItem("projects", JSON.stringify(updatedProjects))
  }

  const forceDeleteAllData = () => {
    localStorage.clear()
    setUsers([])
    setTickets([])
    setProjects([])
    const superuser = {
      id: "superuser-infonit",
      username: "infonit",
      email: "admin@infonit.com",
      role: "superuser",
      permissions: {
        devices: { read: true, write: true, delete: true },
        assets: { read: true, write: true, delete: true },
        users: { read: true, write: true, delete: true },
        tickets: { read: true, write: true, delete: true },
        maintenance: { read: true, write: true, delete: true },
        reports: { read: true, write: true, delete: true },
        settings: { read: true, write: true, delete: true },
        development: { read: true, write: true, delete: true },
      },
    }
    localStorage.setItem("users", JSON.stringify([superuser]))
    localStorage.setItem("currentUser", JSON.stringify(superuser))
  }

  if (currentUser?.role !== "superuser") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied. Superuser privileges required.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            God Mode Panel
          </h2>
          <p className="text-muted-foreground">Complete system control and management</p>
        </div>
        <Badge variant="destructive" className="text-lg px-4 py-2">
          <Shield className="h-4 w-4 mr-2" />
          SUPERUSER ACCESS
        </Badge>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="tickets">Ticket Control</TabsTrigger>
          <TabsTrigger value="projects">Project Management</TabsTrigger>
          <TabsTrigger value="system">System Control</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">All Users ({users.length})</h3>
            <Button
              onClick={() => {
                setSelectedUser(null)
                setIsUserDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="space-y-2 p-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge
                          variant={
                            user.role === "superuser" ? "destructive" : user.role === "admin" ? "default" : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsUserDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.role !== "superuser" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete user "{user.username}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteUser(user.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">All Tickets ({tickets.length})</h3>
            <Button
              onClick={() => {
                setSelectedTicket(null)
                setIsTicketDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="space-y-2 p-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{ticket.title}</p>
                          <p className="text-sm text-muted-foreground">
                            #{ticket.id} • {ticket.category}
                          </p>
                        </div>
                        <Badge
                          variant={
                            ticket.priority === "critical"
                              ? "destructive"
                              : ticket.priority === "high"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {ticket.priority}
                        </Badge>
                        <Badge variant="outline">{ticket.status}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTicket(ticket)
                            setIsTicketDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete ticket "{ticket.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteTicket(ticket.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">All Projects ({projects.length})</h3>
            <Button onClick={createProject}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="space-y-2 p-4">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-24 bg-secondary rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-muted-foreground">{project.progress}%</span>
                          </div>
                        </div>
                        <Badge
                          variant={
                            project.status === "active"
                              ? "default"
                              : project.status === "completed"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {project.status}
                        </Badge>
                        <Badge
                          variant={
                            project.priority === "critical"
                              ? "destructive"
                              : project.priority === "high"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {project.priority}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProject(project)
                            setIsProjectDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Project</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete project "{project.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteProject(project.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Dangerous Operations</CardTitle>
                <CardDescription>These actions cannot be undone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Database className="h-4 w-4 mr-2" />
                      Wipe All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Wipe All System Data</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete ALL data including users, devices, assets, tickets, and projects.
                        Only the superuser account will remain. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={forceDeleteAllData} className="bg-red-600 hover:bg-red-700">
                        Wipe Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Current system status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Total Users:</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                  <div>
                    <p className="font-medium">Total Tickets:</p>
                    <p className="text-2xl font-bold">{tickets.length}</p>
                  </div>
                  <div>
                    <p className="font-medium">Total Projects:</p>
                    <p className="text-2xl font-bold">{projects.length}</p>
                  </div>
                  <div>
                    <p className="font-medium">System Status:</p>
                    <Badge variant="default">Online</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <UserFormModal
        isOpen={isUserDialogOpen}
        onClose={() => {
          setIsUserDialogOpen(false)
          setSelectedUser(null)
        }}
        onSave={handleSaveUser}
        user={selectedUser || undefined}
      />

      <TicketFormModal
        isOpen={isTicketDialogOpen}
        onClose={() => {
          setIsTicketDialogOpen(false)
          setSelectedTicket(null)
        }}
        onSave={handleSaveTicket}
        ticket={selectedTicket || undefined}
        devices={devices}
        assets={assets}
        users={users}
      />
    </div>
  )
}
