"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Device, Contact } from "@/types"

interface DeviceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (device: Omit<Device, "id">) => void
  device?: Device
  mode: "add" | "edit"
}

export default function DeviceFormModal({ isOpen, onClose, onSave, device, mode }: DeviceFormModalProps) {
  const [formData, setFormData] = useState<Omit<Device, "id">>({
    name: device?.name || "",
    model: device?.model || "",
    ip: device?.ip || "",
    mac: device?.mac || "",
    type: device?.type || "Computer",
    status: device?.status || "Active",
    category: device?.category || "Hardware",
    location: device?.location || "",
    username: device?.username || "",
    password: device?.password || "",
    port: device?.port || undefined,
    url: device?.url || "",
    access: device?.access || "",
    primaryContacts: device?.primaryContacts || [],
    secondaryContacts: device?.secondaryContacts || [],
    notes: device?.notes || "",
    purchaseDate: device?.purchaseDate || "",
    warrantyExpiry: device?.warrantyExpiry || "",
    vendor: device?.vendor || "",
    serial: device?.serial || "",
    lastMaintenance: device?.lastMaintenance || "",
    nextMaintenance: device?.nextMaintenance || "",
    maintenanceInterval: device?.maintenanceInterval || undefined,
    maintenanceStatus: device?.maintenanceStatus || "Up to date",
    maintenanceNotes: device?.maintenanceNotes || "",
    spareParts: device?.spareParts || [],
    lastUpdated: new Date().toISOString().split("T")[0],
  })

  const [activeTab, setActiveTab] = useState<"basic" | "network" | "contacts" | "maintenance">("basic")

  const handleInputChange = (field: keyof Omit<Device, "id">, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const addContact = (type: "primary" | "secondary") => {
    const newContact: Contact = { name: "", role: "", email: "", phone: "" }
    if (type === "primary") {
      handleInputChange("primaryContacts", [...(formData.primaryContacts || []), newContact])
    } else {
      handleInputChange("secondaryContacts", [...(formData.secondaryContacts || []), newContact])
    }
  }

  const updateContact = (type: "primary" | "secondary", index: number, field: keyof Contact, value: string) => {
    const contacts = type === "primary" ? formData.primaryContacts || [] : formData.secondaryContacts || []
    const updatedContacts = [...contacts]
    updatedContacts[index] = { ...updatedContacts[index], [field]: value }
    handleInputChange(type === "primary" ? "primaryContacts" : "secondaryContacts", updatedContacts)
  }

  const removeContact = (type: "primary" | "secondary", index: number) => {
    const contacts = type === "primary" ? formData.primaryContacts || [] : formData.secondaryContacts || []
    const updatedContacts = contacts.filter((_, i) => i !== index)
    handleInputChange(type === "primary" ? "primaryContacts" : "secondaryContacts", updatedContacts)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Device" : "Edit Device"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Tab Navigation */}
          <div className="flex border-b mb-6">
            {[
              { key: "basic", label: "Basic Info", icon: "fas fa-info-circle" },
              { key: "network", label: "Network", icon: "fas fa-network-wired" },
              { key: "contacts", label: "Contacts", icon: "fas fa-address-book" },
              { key: "maintenance", label: "Maintenance", icon: "fas fa-tools" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Device Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter device name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  placeholder="Enter device model"
                />
              </div>
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer">Computer</SelectItem>
                    <SelectItem value="Server">Server</SelectItem>
                    <SelectItem value="Router">Router</SelectItem>
                    <SelectItem value="Switch">Switch</SelectItem>
                    <SelectItem value="Printer">Printer</SelectItem>
                    <SelectItem value="Phone">Phone</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Enter location"
                />
              </div>
              <div>
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  value={formData.vendor || ""}
                  onChange={(e) => handleInputChange("vendor", e.target.value)}
                  placeholder="Enter vendor"
                />
              </div>
              <div>
                <Label htmlFor="serial">Serial Number</Label>
                <Input
                  id="serial"
                  value={formData.serial || ""}
                  onChange={(e) => handleInputChange("serial", e.target.value)}
                  placeholder="Enter serial number"
                />
              </div>
              <div>
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate || ""}
                  onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Enter any additional notes"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Network Tab */}
          {activeTab === "network" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ip">IP Address *</Label>
                <Input
                  id="ip"
                  value={formData.ip}
                  onChange={(e) => handleInputChange("ip", e.target.value)}
                  placeholder="192.168.1.100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="mac">MAC Address</Label>
                <Input
                  id="mac"
                  value={formData.mac}
                  onChange={(e) => handleInputChange("mac", e.target.value)}
                  placeholder="00:11:22:33:44:55"
                />
              </div>
              <div>
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.port || ""}
                  onChange={(e) =>
                    handleInputChange("port", e.target.value ? Number.parseInt(e.target.value) : undefined)
                  }
                  placeholder="22"
                />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formData.url || ""}
                  onChange={(e) => handleInputChange("url", e.target.value)}
                  placeholder="https://device.example.com"
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username || ""}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="admin"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password || ""}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="access">Access Notes</Label>
                <Textarea
                  id="access"
                  value={formData.access || ""}
                  onChange={(e) => handleInputChange("access", e.target.value)}
                  placeholder="Special access instructions or requirements"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === "contacts" && (
            <div className="space-y-6">
              {/* Primary Contacts */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">Primary Contacts</h3>
                  <Button type="button" onClick={() => addContact("primary")} size="sm">
                    <i className="fas fa-plus mr-2"></i>Add Contact
                  </Button>
                </div>
                {(formData.primaryContacts || []).map((contact, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-lg mb-3">
                    <Input
                      placeholder="Name"
                      value={contact.name}
                      onChange={(e) => updateContact("primary", index, "name", e.target.value)}
                    />
                    <Input
                      placeholder="Role"
                      value={contact.role}
                      onChange={(e) => updateContact("primary", index, "role", e.target.value)}
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={contact.email}
                      onChange={(e) => updateContact("primary", index, "email", e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Phone"
                        value={contact.phone}
                        onChange={(e) => updateContact("primary", index, "phone", e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeContact("primary", index)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Secondary Contacts */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">Secondary Contacts</h3>
                  <Button type="button" onClick={() => addContact("secondary")} size="sm">
                    <i className="fas fa-plus mr-2"></i>Add Contact
                  </Button>
                </div>
                {(formData.secondaryContacts || []).map((contact, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-lg mb-3">
                    <Input
                      placeholder="Name"
                      value={contact.name}
                      onChange={(e) => updateContact("secondary", index, "name", e.target.value)}
                    />
                    <Input
                      placeholder="Role"
                      value={contact.role}
                      onChange={(e) => updateContact("secondary", index, "role", e.target.value)}
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={contact.email}
                      onChange={(e) => updateContact("secondary", index, "email", e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Phone"
                        value={contact.phone}
                        onChange={(e) => updateContact("secondary", index, "phone", e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeContact("secondary", index)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === "maintenance" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lastMaintenance">Last Maintenance</Label>
                <Input
                  id="lastMaintenance"
                  type="date"
                  value={formData.lastMaintenance || ""}
                  onChange={(e) => handleInputChange("lastMaintenance", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="nextMaintenance">Next Maintenance</Label>
                <Input
                  id="nextMaintenance"
                  type="date"
                  value={formData.nextMaintenance || ""}
                  onChange={(e) => handleInputChange("nextMaintenance", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="maintenanceInterval">Maintenance Interval (days)</Label>
                <Input
                  id="maintenanceInterval"
                  type="number"
                  value={formData.maintenanceInterval || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "maintenanceInterval",
                      e.target.value ? Number.parseInt(e.target.value) : undefined,
                    )
                  }
                  placeholder="90"
                />
              </div>
              <div>
                <Label htmlFor="maintenanceStatus">Maintenance Status</Label>
                <Select
                  value={formData.maintenanceStatus || "Up to date"}
                  onValueChange={(value) => handleInputChange("maintenanceStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Up to date">Up to date</SelectItem>
                    <SelectItem value="Due soon">Due soon</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                    <SelectItem value="In progress">In progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                <Input
                  id="warrantyExpiry"
                  type="date"
                  value={formData.warrantyExpiry || ""}
                  onChange={(e) => handleInputChange("warrantyExpiry", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="maintenanceNotes">Maintenance Notes</Label>
                <Textarea
                  id="maintenanceNotes"
                  value={formData.maintenanceNotes || ""}
                  onChange={(e) => handleInputChange("maintenanceNotes", e.target.value)}
                  placeholder="Enter maintenance notes and history"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <i className="fas fa-save mr-2"></i>
              {mode === "add" ? "Add Device" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
