"use client"

import { useState } from "react"
import type { ContactInfo, User } from "@/types"
import ContactFormModal from "@/components/forms/contact-form-modal"

interface ContactsViewProps {
  contacts: ContactInfo[]
  setContacts: (contacts: ContactInfo[]) => void
  user: User
}

export default function ContactsView({ contacts, setContacts, user }: ContactsViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<ContactInfo | undefined>(undefined)

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = filterCategory === "all" || contact.category === filterCategory

    return matchesSearch && matchesCategory
  })

  const handleAddContact = () => {
    setEditingContact(undefined)
    setIsModalOpen(true)
  }

  const handleEditContact = (contact: ContactInfo) => {
    setEditingContact(contact)
    setIsModalOpen(true)
  }

  const handleSaveContact = (contact: ContactInfo) => {
    if (editingContact) {
      // Update existing contact
      const updatedContacts = contacts.map((c) => (c.id === contact.id ? contact : c))
      setContacts(updatedContacts)
      localStorage.setItem("infonit_contacts", JSON.stringify(updatedContacts))
    } else {
      // Add new contact
      const newContacts = [...contacts, contact]
      setContacts(newContacts)
      localStorage.setItem("infonit_contacts", JSON.stringify(newContacts))
    }
  }

  const handleDeleteContact = (contactId: number) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      const updatedContacts = contacts.filter((c) => c.id !== contactId)
      setContacts(updatedContacts)
      localStorage.setItem("infonit_contacts", JSON.stringify(updatedContacts))
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "client":
        return "bg-blue-100 text-blue-800"
      case "vendor":
        return "bg-purple-100 text-purple-800"
      case "employee":
        return "bg-green-100 text-green-800"
      case "contractor":
        return "bg-orange-100 text-orange-800"
      case "partner":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-6">
        <div className="flex items-center mb-4 lg:mb-0">
          <h2 className="text-2xl font-bold text-gray-800">Contacts</h2>
          <span className="ml-3 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {filteredContacts.length} contacts
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="client">Clients</option>
            <option value="vendor">Vendors</option>
            <option value="employee">Employees</option>
            <option value="contractor">Contractors</option>
            <option value="partner">Partners</option>
            <option value="other">Other</option>
          </select>

          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contacts..."
              className="pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>

          <button
            onClick={handleAddContact}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md flex items-center"
          >
            <i className="fas fa-plus mr-2"></i> Add Contact
          </button>
        </div>
      </div>

      {filteredContacts.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <i className="fas fa-address-book text-gray-400 text-3xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No contacts found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first contact"}
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddContact}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md"
            >
              <i className="fas fa-plus mr-2"></i> Add Your First Contact
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <div key={contact.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-100 rounded-lg p-2">
                  <i className="fas fa-user text-blue-600"></i>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(contact.category)}`}>
                    {contact.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                    {contact.status}
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-gray-800 mb-1">
                {contact.firstName} {contact.lastName}
              </h3>
              {contact.jobTitle && <p className="text-sm text-gray-600 mb-1">{contact.jobTitle}</p>}
              {contact.company && <p className="text-sm text-gray-500 mb-2">{contact.company}</p>}

              <div className="space-y-1 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <i className="fas fa-envelope w-4 mr-2"></i>
                  <span className="truncate">{contact.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <i className="fas fa-phone w-4 mr-2"></i>
                  <span>{contact.phone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(contact.priority)}`}>
                  {contact.priority} priority
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditContact(contact)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit Contact"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete Contact"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ContactFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveContact}
        contact={editingContact}
      />
    </div>
  )
}
