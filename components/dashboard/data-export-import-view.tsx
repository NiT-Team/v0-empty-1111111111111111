"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Download,
  Upload,
  FileText,
  Database,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  FileJson,
  Archive,
  Server,
  HardDrive,
  Users,
  Package,
  FolderOpen,
  Bell,
  CheckSquare,
  Play,
  X,
} from "lucide-react"

interface ExportJob {
  id: string
  name: string
  type: "export" | "import"
  module: string
  format: "csv" | "json" | "xlsx" | "backup"
  status: "pending" | "running" | "completed" | "failed" | "cancelled"
  progress: number
  totalRecords: number
  processedRecords: number
  createdAt: Date
  completedAt?: Date
  filePath?: string
  fileSize?: number
  error?: string
}

interface ExportTemplate {
  id: string
  name: string
  description: string
  modules: string[]
  format: string
  schedule?: {
    enabled: boolean
    frequency: "daily" | "weekly" | "monthly"
    time: string
    lastRun?: Date
    nextRun?: Date
  }
  filters?: any
  createdAt: Date
}

const DATA_MODULES = [
  { id: "devices", name: "Devices", icon: Server, description: "Hardware devices and equipment" },
  { id: "assets", name: "Digital Assets", icon: HardDrive, description: "Software and digital resources" },
  { id: "inventory", name: "Inventory", icon: Package, description: "Stock items and consumables" },
  { id: "users", name: "Users", icon: Users, description: "User accounts and profiles" },
  { id: "projects", name: "Projects", icon: FolderOpen, description: "Project data and materials" },
  { id: "contacts", name: "Contacts", icon: Users, description: "Contact information" },
  { id: "tasks", name: "Tasks", icon: CheckSquare, description: "Tasks and todo lists" },
  { id: "notifications", name: "Notifications", icon: Bell, description: "System notifications" },
  { id: "all", name: "Complete Backup", icon: Database, description: "Full system backup" },
]

const EXPORT_FORMATS = [
  { id: "csv", name: "CSV", icon: FileText, description: "Comma-separated values" },
  { id: "json", name: "JSON", icon: FileJson, description: "JavaScript Object Notation" },
  { id: "xlsx", name: "Excel", icon: FileSpreadsheet, description: "Microsoft Excel format" },
  { id: "backup", name: "System Backup", icon: Archive, description: "Complete system backup" },
]

export default function DataExportImportView() {
  const [activeTab, setActiveTab] = useState("export")
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([])
  const [exportTemplates, setExportTemplates] = useState<ExportTemplate[]>([])
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [selectedFormat, setSelectedFormat] = useState("csv")
  const [exportName, setExportName] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importResults, setImportResults] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load export jobs and templates from localStorage
    const savedJobs = localStorage.getItem("infonit_export_jobs")
    if (savedJobs) {
      setExportJobs(
        JSON.parse(savedJobs).map((job: any) => ({
          ...job,
          createdAt: new Date(job.createdAt),
          completedAt: job.completedAt ? new Date(job.completedAt) : undefined,
        })),
      )
    }

    const savedTemplates = localStorage.getItem("infonit_export_templates")
    if (savedTemplates) {
      setExportTemplates(
        JSON.parse(savedTemplates).map((template: any) => ({
          ...template,
          createdAt: new Date(template.createdAt),
          schedule: template.schedule
            ? {
                ...template.schedule,
                lastRun: template.schedule.lastRun ? new Date(template.schedule.lastRun) : undefined,
                nextRun: template.schedule.nextRun ? new Date(template.schedule.nextRun) : undefined,
              }
            : undefined,
        })),
      )
    } else {
      // Create default templates
      const defaultTemplates: ExportTemplate[] = [
        {
          id: "template-1",
          name: "Daily Device Report",
          description: "Export all device data daily",
          modules: ["devices"],
          format: "csv",
          schedule: {
            enabled: true,
            frequency: "daily",
            time: "09:00",
            nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
          createdAt: new Date(),
        },
        {
          id: "template-2",
          name: "Weekly Inventory Report",
          description: "Export inventory data weekly",
          modules: ["inventory"],
          format: "xlsx",
          schedule: {
            enabled: false,
            frequency: "weekly",
            time: "08:00",
          },
          createdAt: new Date(),
        },
      ]
      setExportTemplates(defaultTemplates)
      localStorage.setItem("infonit_export_templates", JSON.stringify(defaultTemplates))
    }
  }, [])

  const startExport = async () => {
    if (selectedModules.length === 0 || !exportName.trim()) return

    setIsExporting(true)

    const newJob: ExportJob = {
      id: `export-${Date.now()}`,
      name: exportName,
      type: "export",
      module: selectedModules.join(", "),
      format: selectedFormat as any,
      status: "running",
      progress: 0,
      totalRecords: 0,
      processedRecords: 0,
      createdAt: new Date(),
    }

    // Calculate total records
    let totalRecords = 0
    for (const module of selectedModules) {
      const data = getModuleData(module)
      totalRecords += data.length
    }
    newJob.totalRecords = totalRecords

    const updatedJobs = [newJob, ...exportJobs]
    setExportJobs(updatedJobs)
    localStorage.setItem("infonit_export_jobs", JSON.stringify(updatedJobs))

    // Simulate export process
    let processedRecords = 0
    const exportData: any = {}

    for (const module of selectedModules) {
      const data = getModuleData(module)
      exportData[module] = data

      // Simulate processing time
      for (let i = 0; i < data.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50)) // Simulate processing time
        processedRecords++
        const progress = Math.round((processedRecords / totalRecords) * 100)

        // Update job progress
        const jobIndex = updatedJobs.findIndex((j) => j.id === newJob.id)
        if (jobIndex !== -1) {
          updatedJobs[jobIndex] = {
            ...updatedJobs[jobIndex],
            progress,
            processedRecords,
          }
          setExportJobs([...updatedJobs])
        }
      }
    }

    // Complete export
    const completedJob = {
      ...newJob,
      status: "completed" as const,
      progress: 100,
      processedRecords: totalRecords,
      completedAt: new Date(),
      filePath: `exports/${exportName}.${selectedFormat}`,
      fileSize: Math.round(JSON.stringify(exportData).length / 1024), // Approximate size in KB
    }

    const finalJobs = updatedJobs.map((j) => (j.id === newJob.id ? completedJob : j))
    setExportJobs(finalJobs)
    localStorage.setItem("infonit_export_jobs", JSON.stringify(finalJobs))

    // Generate and download file
    generateExportFile(exportData, selectedFormat, exportName)

    setIsExporting(false)
    setExportName("")
    setSelectedModules([])
  }

  const getModuleData = (module: string) => {
    switch (module) {
      case "devices":
        return JSON.parse(localStorage.getItem("devices") || "[]")
      case "assets":
        return JSON.parse(localStorage.getItem("assets") || "[]")
      case "inventory":
        return JSON.parse(localStorage.getItem("infonit_inventory") || "[]")
      case "users":
        return JSON.parse(localStorage.getItem("users") || "[]")
      case "projects":
        return JSON.parse(localStorage.getItem("infonit_projects") || "[]")
      case "contacts":
        return JSON.parse(localStorage.getItem("infonit_contacts") || "[]")
      case "tasks":
        return JSON.parse(localStorage.getItem("infonit_tasks") || "[]")
      case "notifications":
        return JSON.parse(localStorage.getItem("infonit_notifications") || "[]")
      case "all":
        return {
          devices: JSON.parse(localStorage.getItem("devices") || "[]"),
          assets: JSON.parse(localStorage.getItem("assets") || "[]"),
          inventory: JSON.parse(localStorage.getItem("infonit_inventory") || "[]"),
          users: JSON.parse(localStorage.getItem("users") || "[]"),
          projects: JSON.parse(localStorage.getItem("infonit_projects") || "[]"),
          contacts: JSON.parse(localStorage.getItem("infonit_contacts") || "[]"),
          tasks: JSON.parse(localStorage.getItem("infonit_tasks") || "[]"),
          notifications: JSON.parse(localStorage.getItem("infonit_notifications") || "[]"),
        }
      default:
        return []
    }
  }

  const generateExportFile = (data: any, format: string, filename: string) => {
    let content: string
    let mimeType: string
    let extension: string

    switch (format) {
      case "json":
        content = JSON.stringify(data, null, 2)
        mimeType = "application/json"
        extension = "json"
        break
      case "csv":
        content = convertToCSV(data)
        mimeType = "text/csv"
        extension = "csv"
        break
      case "xlsx":
        // For demo purposes, we'll export as CSV
        content = convertToCSV(data)
        mimeType = "text/csv"
        extension = "csv"
        break
      default:
        content = JSON.stringify(data, null, 2)
        mimeType = "application/json"
        extension = "json"
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${filename}.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const convertToCSV = (data: any) => {
    if (Array.isArray(data)) {
      if (data.length === 0) return ""
      const headers = Object.keys(data[0])
      const csvContent = [
        headers.join(","),
        ...data.map((row) => headers.map((header) => JSON.stringify(row[header] || "")).join(",")),
      ].join("\n")
      return csvContent
    } else {
      // Handle object with multiple modules
      let csvContent = ""
      Object.keys(data).forEach((module) => {
        csvContent += `\n--- ${module.toUpperCase()} ---\n`
        if (Array.isArray(data[module]) && data[module].length > 0) {
          const headers = Object.keys(data[module][0])
          csvContent += headers.join(",") + "\n"
          csvContent += data[module]
            .map((row: any) => headers.map((header) => JSON.stringify(row[header] || "")).join(","))
            .join("\n")
        }
        csvContent += "\n"
      })
      return csvContent
    }
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportFile(file)
    setIsImporting(true)
    setImportProgress(0)

    try {
      const content = await file.text()
      let importData: any

      if (file.name.endsWith(".json")) {
        importData = JSON.parse(content)
      } else if (file.name.endsWith(".csv")) {
        importData = parseCSV(content)
      } else {
        throw new Error("Unsupported file format")
      }

      // Simulate import progress
      for (let i = 0; i <= 100; i += 10) {
        setImportProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      // Process import data
      const results = await processImportData(importData)
      setImportResults(results)

      // Create import job record
      const importJob: ExportJob = {
        id: `import-${Date.now()}`,
        name: file.name,
        type: "import",
        module: "imported",
        format: file.name.endsWith(".json") ? "json" : "csv",
        status: "completed",
        progress: 100,
        totalRecords: results.totalRecords,
        processedRecords: results.successfulRecords,
        createdAt: new Date(),
        completedAt: new Date(),
        fileSize: Math.round(file.size / 1024),
      }

      const updatedJobs = [importJob, ...exportJobs]
      setExportJobs(updatedJobs)
      localStorage.setItem("infonit_export_jobs", JSON.stringify(updatedJobs))
    } catch (error) {
      console.error("Import error:", error)
      setImportResults({
        success: false,
        error: error instanceof Error ? error.message : "Import failed",
        totalRecords: 0,
        successfulRecords: 0,
        failedRecords: 0,
      })
    } finally {
      setIsImporting(false)
    }
  }

  const parseCSV = (content: string) => {
    const lines = content.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim())
    const data = []

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""))
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })
        data.push(row)
      }
    }

    return data
  }

  const processImportData = async (data: any) => {
    // Simulate data processing and validation
    let totalRecords = 0
    let successfulRecords = 0
    let failedRecords = 0
    const errors: string[] = []

    if (Array.isArray(data)) {
      totalRecords = data.length
      // Simulate validation
      data.forEach((record, index) => {
        if (record.name && record.id) {
          successfulRecords++
        } else {
          failedRecords++
          errors.push(`Row ${index + 1}: Missing required fields`)
        }
      })
    } else if (typeof data === "object") {
      Object.keys(data).forEach((key) => {
        if (Array.isArray(data[key])) {
          totalRecords += data[key].length
          successfulRecords += data[key].length // Simplified validation
        }
      })
    }

    return {
      success: failedRecords === 0,
      totalRecords,
      successfulRecords,
      failedRecords,
      errors,
    }
  }

  const cancelJob = (jobId: string) => {
    const updatedJobs = exportJobs.map((job) =>
      job.id === jobId && job.status === "running" ? { ...job, status: "cancelled" as const } : job,
    )
    setExportJobs(updatedJobs)
    localStorage.setItem("infonit_export_jobs", JSON.stringify(updatedJobs))
  }

  const deleteJob = (jobId: string) => {
    const updatedJobs = exportJobs.filter((job) => job.id !== jobId)
    setExportJobs(updatedJobs)
    localStorage.setItem("infonit_export_jobs", JSON.stringify(updatedJobs))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "running":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Export & Import</h1>
          <p className="text-gray-600">Export data for backup or analysis, import data from external sources</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="jobs">Jobs History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Export Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Export Configuration</CardTitle>
                <CardDescription>Select data modules and format for export</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Export Name</label>
                  <Input
                    placeholder="Enter export name..."
                    value={exportName}
                    onChange={(e) => setExportName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Data Modules</label>
                  <div className="grid grid-cols-1 gap-2">
                    {DATA_MODULES.map((module) => (
                      <label key={module.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={selectedModules.includes(module.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedModules([...selectedModules, module.id])
                            } else {
                              setSelectedModules(selectedModules.filter((m) => m !== module.id))
                            }
                          }}
                        />
                        <module.icon className="h-4 w-4 text-gray-500" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{module.name}</div>
                          <div className="text-xs text-gray-500">{module.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Export Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    {EXPORT_FORMATS.map((format) => (
                      <label
                        key={format.id}
                        className={`flex items-center space-x-2 p-3 border rounded cursor-pointer ${
                          selectedFormat === format.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="format"
                          value={format.id}
                          checked={selectedFormat === format.id}
                          onChange={(e) => setSelectedFormat(e.target.value)}
                        />
                        <format.icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium text-sm">{format.name}</div>
                          <div className="text-xs text-gray-500">{format.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={startExport}
                  disabled={selectedModules.length === 0 || !exportName.trim() || isExporting}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? "Exporting..." : "Start Export"}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Export Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Export Templates</CardTitle>
                <CardDescription>Pre-configured export templates for common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exportTemplates.slice(0, 5).map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-gray-500">{template.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {template.format.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.modules.length} modules
                          </Badge>
                          {template.schedule?.enabled && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              Scheduled
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedModules(template.modules)
                          setSelectedFormat(template.format)
                          setExportName(template.name)
                        }}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Use
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Import Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Import Data</CardTitle>
                <CardDescription>Upload and import data from external files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Upload File</h3>
                  <p className="text-gray-500 mb-4">Drag and drop your file here, or click to browse</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json,.xlsx"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                  <Button onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">Supported formats: CSV, JSON, Excel</p>
                </div>

                {isImporting && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Importing {importFile?.name}...</span>
                      <span className="text-sm">{importProgress}%</span>
                    </div>
                    <Progress value={importProgress} />
                  </div>
                )}

                {importResults && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Import Results</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-2xl font-bold text-green-600">{importResults.successfulRecords}</div>
                        <div className="text-xs text-green-600">Successful</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded">
                        <div className="text-2xl font-bold text-red-600">{importResults.failedRecords}</div>
                        <div className="text-xs text-red-600">Failed</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-gray-600">{importResults.totalRecords}</div>
                        <div className="text-xs text-gray-600">Total</div>
                      </div>
                    </div>
                    {importResults.errors && importResults.errors.length > 0 && (
                      <div className="p-3 bg-red-50 rounded">
                        <h5 className="font-medium text-red-800 mb-2">Errors:</h5>
                        <ul className="text-sm text-red-700 space-y-1">
                          {importResults.errors.slice(0, 5).map((error: string, index: number) => (
                            <li key={index}>• {error}</li>
                          ))}
                          {importResults.errors.length > 5 && (
                            <li>• ... and {importResults.errors.length - 5} more errors</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Import Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Import Guidelines</CardTitle>
                <CardDescription>Best practices for importing data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">File Format Requirements</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• CSV files must have headers in the first row</li>
                      <li>• JSON files should be properly formatted arrays or objects</li>
                      <li>• Excel files will be converted to CSV format</li>
                      <li>• Maximum file size: 10MB</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Data Validation</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Required fields must be present</li>
                      <li>• Data types will be validated</li>
                      <li>• Duplicate entries will be flagged</li>
                      <li>• Invalid records will be skipped</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Sample Templates</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                        <Download className="h-3 w-3 mr-2" />
                        Download Device Template
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                        <Download className="h-3 w-3 mr-2" />
                        Download User Template
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                        <Download className="h-3 w-3 mr-2" />
                        Download Inventory Template
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export/Import History</CardTitle>
              <CardDescription>View and manage your export and import jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exportJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(job.status)}
                      <div className="flex-1">
                        <h4 className="font-medium">{job.name}</h4>
                        <p className="text-sm text-gray-600">
                          {job.type === "export" ? "Export" : "Import"} • {job.module} • {job.format.toUpperCase()}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <Badge className={`text-xs ${getStatusColor(job.status)}`}>{job.status}</Badge>
                          <span className="text-xs text-gray-500">
                            {job.processedRecords}/{job.totalRecords} records
                          </span>
                          {job.fileSize && <span className="text-xs text-gray-500">{job.fileSize} KB</span>}
                          <span className="text-xs text-gray-500">
                            {job.createdAt.toLocaleDateString()} {job.createdAt.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {job.status === "running" && (
                        <div className="w-24">
                          <Progress value={job.progress} />
                        </div>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {job.status === "completed" && job.type === "export" && (
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download Again
                            </DropdownMenuItem>
                          )}
                          {job.status === "running" && (
                            <DropdownMenuItem onClick={() => cancelJob(job.id)}>
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600" onClick={() => deleteJob(job.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}

                {exportJobs.length === 0 && (
                  <div className="text-center py-12">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No jobs yet</h3>
                    <p className="text-gray-500">Your export and import jobs will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Templates</CardTitle>
              <CardDescription>Manage reusable export configurations and schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exportTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {template.format.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.modules.join(", ")}
                        </Badge>
                        {template.schedule?.enabled && (
                          <Badge variant="outline" className="text-xs text-green-600">
                            {template.schedule.frequency} at {template.schedule.time}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm">
                        <Play className="h-3 w-3 mr-1" />
                        Run
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
