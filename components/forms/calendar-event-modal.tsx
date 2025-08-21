"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { CalendarEvent } from "@/types"

interface CalendarEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  event?: CalendarEvent
  selectedDate?: Date | null
}

export default function CalendarEventModal({ isOpen, onClose, onSave, event, selectedDate }: CalendarEventModalProps) {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    allDay: false,
    location: "",
    type: "meeting",
    priority: "medium",
    status: "scheduled",
    attendees: [],
    isPrivate: false,
    reminders: [],
  })

  const [attendeeInput, setAttendeeInput] = useState("")

  useEffect(() => {
    if (event) {
      setFormData(event)
    } else {
      const defaultStart = selectedDate || new Date()
      const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000) // 1 hour later

      setFormData({
        title: "",
        description: "",
        startDate: defaultStart.toISOString().slice(0, 16),
        endDate: defaultEnd.toISOString().slice(0, 16),
        allDay: false,
        location: "",
        type: "meeting",
        priority: "medium",
        status: "scheduled",
        attendees: [],
        isPrivate: false,
        reminders: [],
      })
    }
  }, [event, selectedDate, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleAddAttendee = () => {
    if (attendeeInput.trim() && !formData.attendees?.includes(attendeeInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        attendees: [...(prev.attendees || []), attendeeInput.trim()],
      }))
      setAttendeeInput("")
    }
  }

  const handleRemoveAttendee = (attendeeToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees?.filter((attendee) => attendee !== attendeeToRemove) || [],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const eventData: CalendarEvent = {
      id: event?.id || `event_${Date.now()}`,
      title: formData.title || "",
      description: formData.description,
      startDate: formData.startDate || "",
      endDate: formData.endDate || "",
      allDay: formData.allDay || false,
      location: formData.location,
      attendees: formData.attendees || [],
      type: (formData.type as CalendarEvent["type"]) || "meeting",
      priority: (formData.priority as CalendarEvent["priority"]) || "medium",
      status: (formData.status as CalendarEvent["status"]) || "scheduled",
      reminders: formData.reminders || [],
      attachments: formData.attachments || [],
      createdAt: event?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: event?.createdBy || "current-user",
      color: formData.color,
      isPrivate: formData.isPrivate || false,
      relatedTickets: formData.relatedTickets || [],
      relatedProjects: formData.relatedProjects || [],
      relatedDevices: formData.relatedDevices || [],
    }

    onSave(eventData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{event ? "Edit Event" : "Create New Event"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[70vh]">
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title || ""}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Event title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Event description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  name="type"
                  value={formData.type || "meeting"}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="meeting">Meeting</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="deadline">Deadline</option>
                  <option value="reminder">Reminder</option>
                  <option value="personal">Personal</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority || "medium"}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="allDay"
                  checked={formData.allDay || false}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                All Day Event
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={formData.isPrivate || false}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Private Event
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                <input
                  type={formData.allDay ? "date" : "datetime-local"}
                  name="startDate"
                  value={formData.allDay ? formData.startDate?.split("T")[0] : formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                <input
                  type={formData.allDay ? "date" : "datetime-local"}
                  name="endDate"
                  value={formData.allDay ? formData.endDate?.split("T")[0] : formData.endDate}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Event location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status || "scheduled"}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attendees</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={attendeeInput}
                  onChange={(e) => setAttendeeInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAttendee())}
                  placeholder="Add attendee email..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddAttendee}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.attendees?.map((attendee, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {attendee}
                    <button
                      type="button"
                      onClick={() => handleRemoveAttendee(attendee)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Color</label>
              <div className="flex gap-2">
                {["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#6B7280"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? "border-gray-800" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {event ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
