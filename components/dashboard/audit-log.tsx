"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, User, Activity } from "lucide-react"

interface AuditEntry {
  id: string
  timestamp: Date
  user: string
  action: string
  resource: string
  resourceId: string
  details: string
  type: "create" | "update" | "delete" | "login" | "logout"
}

export default function AuditLog() {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<AuditEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")

  useEffect(() => {
    // Load audit log from localStorage
    const savedAuditLog = JSON.parse(localStorage.getItem("auditLog") || "[]")
    const entries = savedAuditLog.map((entry) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }))
    setAuditEntries(entries)
    setFilteredEntries(entries)
  }, [])

  useEffect(() => {
    // Filter entries based on search term and type
    let filtered = auditEntries

    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.details.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterType !== "all") {
      filtered = filtered.filter((entry) => entry.type === filterType)
    }

    setFilteredEntries(filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
  }, [auditEntries, searchTerm, filterType])

  const getActionColor = (type: string) => {
    switch (type) {
      case "create":
        return "bg-green-100 text-green-800"
      case "update":
        return "bg-blue-100 text-blue-800"
      case "delete":
        return "bg-red-100 text-red-800"
      case "login":
        return "bg-purple-100 text-purple-800"
      case "logout":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const addAuditEntry = (entry: Omit<AuditEntry, "id" | "timestamp">) => {
    const newEntry: AuditEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date(),
    }

    const updatedEntries = [newEntry, ...auditEntries]
    setAuditEntries(updatedEntries)

    // Save to localStorage
    localStorage.setItem("auditLog", JSON.stringify(updatedEntries))
  }

  // Expose addAuditEntry function globally for other components to use
  useEffect(() => {
    window.addAuditEntry = addAuditEntry
  }, [auditEntries])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Audit Log
          </CardTitle>
          <CardDescription>Track all system activities and user actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search audit log..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-2">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No audit entries found</div>
              ) : (
                filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-xs ${getActionColor(entry.type)}`}>{entry.type.toUpperCase()}</Badge>
                        <span className="text-sm font-medium">{entry.action}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {entry.user}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {entry.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className="font-medium">{entry.resource}</span>
                          {entry.resourceId && <span className="text-xs ml-1">({entry.resourceId})</span>}
                        </div>
                        {entry.details && <div className="mt-1 text-xs">{entry.details}</div>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
