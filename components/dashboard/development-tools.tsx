"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SystemLog, SystemMetrics } from "@/types"
import { Code, Database, Activity, Bug, Download, Upload, Trash2, RefreshCw } from "lucide-react"

interface DevelopmentToolsProps {
  currentUser: any
}

export default function DevelopmentTools({ currentUser }: DevelopmentToolsProps) {
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [selectedLogLevel, setSelectedLogLevel] = useState<string>("all")
  const [sqlQuery, setSqlQuery] = useState("")
  const [queryResult, setQueryResult] = useState<any>(null)

  useEffect(() => {
    loadSystemLogs()
    loadSystemMetrics()
  }, [])

  const loadSystemLogs = () => {
    // Simulate loading system logs
    const mockLogs: SystemLog[] = [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        level: "info",
        module: "Authentication",
        action: "User Login",
        userId: "admin",
        details: "Successful login from IP 192.168.1.100",
        ipAddress: "192.168.1.100",
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        level: "warning",
        module: "Device Management",
        action: "Device Offline",
        details: "Device 'Router-01' went offline",
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        level: "error",
        module: "Database",
        action: "Connection Error",
        details: "Failed to connect to backup database",
      },
    ]
    setLogs(mockLogs)
  }

  const loadSystemMetrics = () => {
    const mockMetrics: SystemMetrics = {
      totalUsers: 25,
      activeUsers: 12,
      totalDevices: 150,
      activeDevices: 142,
      totalAssets: 89,
      openTickets: 8,
      pendingMaintenance: 3,
      systemUptime: "15 days, 4 hours",
      lastBackup: new Date(Date.now() - 86400000).toISOString(),
    }
    setMetrics(mockMetrics)
  }

  const executeQuery = () => {
    // Simulate SQL query execution
    if (sqlQuery.toLowerCase().includes("select")) {
      setQueryResult({
        success: true,
        rows: [
          { id: 1, name: "Sample Data", status: "Active" },
          { id: 2, name: "Test Record", status: "Inactive" },
        ],
        executionTime: "0.045s",
      })
    } else {
      setQueryResult({
        success: true,
        message: "Query executed successfully",
        affectedRows: 1,
        executionTime: "0.023s",
      })
    }
  }

  const filteredLogs = selectedLogLevel === "all" ? logs : logs.filter((log) => log.level === selectedLogLevel)

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "destructive"
      case "warning":
        return "secondary"
      case "info":
        return "default"
      case "debug":
        return "outline"
      default:
        return "default"
    }
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
          <h2 className="text-3xl font-bold tracking-tight">Development Tools</h2>
          <p className="text-muted-foreground">System monitoring and development utilities</p>
        </div>
        <Badge variant="destructive">Superuser Only</Badge>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="database">Database Tools</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          {metrics && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">{metrics.activeUsers} active</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Devices</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalDevices}</div>
                  <p className="text-xs text-muted-foreground">{metrics.activeDevices} online</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                  <Bug className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.openTickets}</div>
                  <p className="text-xs text-muted-foreground">{metrics.pendingMaintenance} maintenance pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.systemUptime}</div>
                  <p className="text-xs text-muted-foreground">
                    Last backup: {new Date(metrics.lastBackup!).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="log-level">Filter by level:</Label>
              <Select value={selectedLogLevel} onValueChange={setSelectedLogLevel}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={loadSystemLogs} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Real-time system activity and error logs</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Badge variant={getLevelColor(log.level) as any}>{log.level.toUpperCase()}</Badge>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{log.module}</span>
                          <span className="text-muted-foreground">•</span>
                          <span>{log.action}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-xs">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                        {log.ipAddress && <p className="text-xs text-muted-foreground">IP: {log.ipAddress}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Query Tool</CardTitle>
              <CardDescription>Execute SQL queries directly on the database</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sql-query">SQL Query</Label>
                <Textarea
                  id="sql-query"
                  placeholder="SELECT * FROM users WHERE role = 'admin';"
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="font-mono"
                  rows={4}
                />
              </div>
              <Button onClick={executeQuery} disabled={!sqlQuery.trim()}>
                <Code className="h-4 w-4 mr-2" />
                Execute Query
              </Button>

              {queryResult && (
                <div className="space-y-2">
                  <Label>Query Result</Label>
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="text-sm">{JSON.stringify(queryResult, null, 2)}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Actions</CardTitle>
                <CardDescription>Administrative system operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export System Data
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import System Data
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Create System Backup
                </Button>
                <Button className="w-full justify-start" variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear System Logs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Monitoring</CardTitle>
                <CardDescription>Real-time system performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span>23%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "23%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span>67%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "67%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Storage Usage</span>
                      <span>45%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "45%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
