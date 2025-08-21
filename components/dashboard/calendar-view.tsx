"use client"

import { useState } from "react"
import type { CalendarEvent, User } from "@/types"
import CalendarEventModal from "@/components/forms/calendar-event-modal"

interface CalendarViewProps {
  events: CalendarEvent[]
  setEvents: (events: CalendarEvent[]) => void
  user: User
}

export default function CalendarView({ events, setEvents, user }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const today = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of month and calculate calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  // Generate calendar days
  const calendarDays = []

  // Previous month days
  const prevMonth = new Date(currentYear, currentMonth - 1, 0)
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth - 1, prevMonth.getDate() - i),
      isCurrentMonth: false,
    })
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth, day),
      isCurrentMonth: true,
    })
  }

  // Next month days to fill grid
  const remainingDays = 42 - calendarDays.length
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth + 1, day),
      isCurrentMonth: false,
    })
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)

      return eventStart <= dateEnd && eventEnd >= dateStart
    })
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleAddEvent = (date?: Date) => {
    setEditingEvent(undefined)
    setSelectedDate(date || null)
    setIsModalOpen(true)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    setSelectedDate(null)
    setIsModalOpen(true)
  }

  const handleSaveEvent = (event: CalendarEvent) => {
    if (editingEvent) {
      // Update existing event
      const updatedEvents = events.map((e) => (e.id === event.id ? event : e))
      setEvents(updatedEvents)
      localStorage.setItem("infonit_events", JSON.stringify(updatedEvents))
    } else {
      // Add new event
      const newEvents = [...events, event]
      setEvents(newEvents)
      localStorage.setItem("infonit_events", JSON.stringify(newEvents))
    }
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      const updatedEvents = events.filter((e) => e.id !== eventId)
      setEvents(updatedEvents)
      localStorage.setItem("infonit_events", JSON.stringify(updatedEvents))
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-500"
      case "maintenance":
        return "bg-orange-500"
      case "deadline":
        return "bg-red-500"
      case "reminder":
        return "bg-yellow-500"
      case "personal":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-red-500"
      case "high":
        return "border-orange-500"
      case "medium":
        return "border-yellow-500"
      case "low":
        return "border-green-500"
      default:
        return "border-gray-300"
    }
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div>
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-6">
        <div className="flex items-center mb-4 lg:mb-0">
          <h2 className="text-2xl font-bold text-gray-800">Smart Calendar</h2>
          <span className="ml-3 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {events.length} events
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                viewMode === "month" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                viewMode === "week" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                viewMode === "day" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Day
            </button>
          </div>

          <button
            onClick={() => handleAddEvent()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md flex items-center"
          >
            <i className="fas fa-plus mr-2"></i> Add Event
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <i className="fas fa-chevron-left text-gray-600"></i>
          </button>
          <h3 className="text-xl font-semibold text-gray-800">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <i className="fas fa-chevron-right text-gray-600"></i>
          </button>
        </div>
        <button
          onClick={handleToday}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
        >
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {dayNames.map((day) => (
            <div key={day} className="p-3 text-center font-medium text-gray-700 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day.date)
            const isToday = day.date.toDateString() === today.toDateString()

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                  !day.isCurrentMonth ? "bg-gray-50" : "bg-white"
                } hover:bg-gray-50 cursor-pointer`}
                onClick={() => handleAddEvent(day.date)}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    !day.isCurrentMonth ? "text-gray-400" : isToday ? "text-blue-600" : "text-gray-800"
                  }`}
                >
                  {day.date.getDate()}
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditEvent(event)
                      }}
                      className={`text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 ${getEventTypeColor(event.type)} ${getPriorityColor(event.priority)} border-l-2`}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {events
            .filter((event) => new Date(event.startDate) >= today)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .slice(0, 5)
            .map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`}></div>
                  <div>
                    <h4 className="font-medium text-gray-800">{event.title}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(event.startDate).toLocaleDateString()} at{" "}
                      {new Date(event.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {event.location && (
                      <p className="text-sm text-gray-500">
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.priority === "critical"
                        ? "bg-red-100 text-red-800"
                        : event.priority === "high"
                          ? "bg-orange-100 text-orange-800"
                          : event.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                    }`}
                  >
                    {event.priority}
                  </span>
                  <button
                    onClick={() => handleEditEvent(event)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Edit Event"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete Event"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <CalendarEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        event={editingEvent}
        selectedDate={selectedDate}
      />
    </div>
  )
}
