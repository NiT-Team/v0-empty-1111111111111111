"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Edit, Trash2, MessageSquare, Clock, User, AlertTriangle } from "lucide-react"
import type { Ticket, Device, Asset, User as UserType } from "@/types"
import TicketFormModal from "@/components/forms/ticket-form-modal"

interface TicketsViewProps {
  onViewChange: (view: string) => void
}

export default function TicketsView({ onViewChange }: TicketsViewProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | undefined>()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const storedTickets = localStorage.getItem("tickets")
    const storedDevices = localStorage.getItem("devices")
    const storedAssets = localStorage.getItem("assets")
    const storedUsers = localStorage.getItem("users")

    if (storedTickets) setTickets(JSON.parse(storedTickets))
    if (storedDevices) setDevices(JSON.parse(storedDevices))
    if (storedAssets) setAssets(JSON.parse(storedAssets))
    if (storedUsers) setUsers(JSON.parse(storedUsers))
  }

  const saveTickets = (updatedTickets: Ticket[]) => {
    localStorage.setItem("tickets", JSON.stringify(updatedTickets))
    setTickets(updatedTickets)
  }

  const handleSaveTicket = (ticketData: Omit<Ticket, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString()

    if (editingTicket) {
      const updatedTickets = tickets.map((ticket) =>
        ticket.id === editingTicket.id
          ? { ...ticketData, id: editingTicket.id, createdAt: editingTicket.createdAt, updatedAt: now }
          : ticket,
      )
      saveTickets(updatedTickets)
    } else {
      const newTicket: Ticket = {
        ...ticketData,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
      }
      saveTickets([...tickets, newTicket])
    }

    setEditingTicket(undefined)
  }

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket)
    setIsModalOpen(true)
  }

  const handleDeleteTicket = (ticketId: string) => {
    if (confirm("Are you sure you want to delete this ticket?")) {
      const updatedTickets = tickets.filter((ticket) => ticket.id !== ticketId)
      saveTickets(updatedTickets)
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter
    const matchesType = typeFilter === "all" || ticket.type === typeFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesType
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in-progress":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTicketStats = () => {
    const stats = {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      inProgress: tickets.filter((t) => t.status === "in-progress").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
      critical: tickets.filter((t) => t.priority === "critical").length,
    }
    return stats
  }

  const stats = getTicketStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Help Desk & Ticketing</h1>
          <p className="text-gray-600">Manage support tickets and help requests</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
              </div>
              <User className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="hardware">Hardware</SelectItem>
                <SelectItem value="software">Software</SelectItem>
                <SelectItem value="network">Network</SelectItem>
                <SelectItem value="access">Access</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-500">
                {tickets.length === 0
                  ? "Create your first support ticket to get started."
                  : "Try adjusting your search or filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => {
            const reporter = users.find((u) => u.id === ticket.reportedBy)
            const assignee = users.find((u) => u.id === ticket.assignedTo)
            const relatedDevice = devices.find((d) => d.id === ticket.deviceId)
            const relatedAsset = assets.find((a) => a.id === ticket.assetId)

            return (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{ticket.title}</h3>
                        <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                        <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("-", " ")}</Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{ticket.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>ID: #{ticket.id}</span>
                        <span>Type: {ticket.type}</span>
                        {reporter && <span>Reporter: {reporter.name}</span>}
                        {assignee && <span>Assignee: {assignee.name}</span>}
                        <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>

                      {(relatedDevice || relatedAsset) && (
                        <div className="mt-2 text-sm text-gray-500">
                          {relatedDevice && <span>Device: {relatedDevice.name}</span>}
                          {relatedAsset && <span>Asset: {relatedAsset.name}</span>}
                        </div>
                      )}

                      {ticket.tags && ticket.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {ticket.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditTicket(ticket)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteTicket(ticket.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Ticket Form Modal */}
      <TicketFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTicket(undefined)
        }}
        onSave={handleSaveTicket}
        ticket={editingTicket}
        devices={devices}
        assets={assets}
        users={users}
      />
    </div>
  )
}
