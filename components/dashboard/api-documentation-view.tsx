"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface APIEndpoint {
  id: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  title: string
  description: string
  category: string
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
    location: "query" | "path" | "body" | "header"
  }>
  requestBody?: {
    type: string
    description: string
    example: string
  }
  responses: Array<{
    status: number
    description: string
    example: string
  }>
  authentication: boolean
}

const apiEndpoints: APIEndpoint[] = [
  {
    id: "get-devices",
    method: "GET",
    path: "/api/devices",
    title: "Get All Devices",
    description: "Retrieve a list of all devices in the system",
    category: "Devices",
    parameters: [
      {
        name: "page",
        type: "integer",
        required: false,
        description: "Page number for pagination",
        location: "query",
      },
      {
        name: "limit",
        type: "integer",
        required: false,
        description: "Number of items per page",
        location: "query",
      },
    ],
    responses: [
      {
        status: 200,
        description: "Successfully retrieved devices",
        example: JSON.stringify(
          {
            devices: [
              {
                id: "1",
                name: "Server-01",
                type: "server",
                status: "active",
                location: "Data Center A",
              },
            ],
            total: 1,
            page: 1,
            limit: 10,
          },
          null,
          2,
        ),
      },
    ],
    authentication: true,
  },
  {
    id: "create-device",
    method: "POST",
    path: "/api/devices",
    title: "Create Device",
    description: "Create a new device in the system",
    category: "Devices",
    requestBody: {
      type: "application/json",
      description: "Device information",
      example: JSON.stringify(
        {
          name: "New Server",
          type: "server",
          location: "Data Center B",
          specifications: {
            cpu: "Intel Xeon",
            ram: "32GB",
            storage: "1TB SSD",
          },
        },
        null,
        2,
      ),
    },
    responses: [
      {
        status: 201,
        description: "Device created successfully",
        example: JSON.stringify(
          {
            id: "2",
            name: "New Server",
            type: "server",
            status: "active",
            createdAt: "2024-01-15T10:30:00Z",
          },
          null,
          2,
        ),
      },
    ],
    authentication: true,
  },
  {
    id: "get-assets",
    method: "GET",
    path: "/api/assets",
    title: "Get All Assets",
    description: "Retrieve a list of all digital assets",
    category: "Assets",
    responses: [
      {
        status: 200,
        description: "Successfully retrieved assets",
        example: JSON.stringify(
          {
            assets: [
              {
                id: "1",
                name: "Company Logo",
                type: "image",
                size: "2.5MB",
                createdAt: "2024-01-10T08:00:00Z",
              },
            ],
          },
          null,
          2,
        ),
      },
    ],
    authentication: true,
  },
  {
    id: "get-inventory",
    method: "GET",
    path: "/api/inventory",
    title: "Get Inventory Items",
    description: "Retrieve inventory items with stock levels",
    category: "Inventory",
    responses: [
      {
        status: 200,
        description: "Successfully retrieved inventory",
        example: JSON.stringify(
          {
            items: [
              {
                id: "1",
                name: "HP Toner Cartridge",
                sku: "HP-Q7516A",
                quantity: 15,
                status: "in-stock",
              },
            ],
          },
          null,
          2,
        ),
      },
    ],
    authentication: true,
  },
]

export default function APIDocumentationView() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null)
  const [testRequest, setTestRequest] = useState({
    method: "GET",
    url: "",
    headers: '{\n  "Authorization": "Bearer your-token-here",\n  "Content-Type": "application/json"\n}',
    body: "",
  })
  const [testResponse, setTestResponse] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = ["all", ...Array.from(new Set(apiEndpoints.map((endpoint) => endpoint.category)))]

  const filteredEndpoints = apiEndpoints.filter((endpoint) => {
    const matchesSearch =
      endpoint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.path.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || endpoint.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-100 text-green-800"
      case "POST":
        return "bg-blue-100 text-blue-800"
      case "PUT":
        return "bg-yellow-100 text-yellow-800"
      case "DELETE":
        return "bg-red-100 text-red-800"
      case "PATCH":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleTestRequest = async () => {
    try {
      setTestResponse("Sending request...")

      // Simulate API call
      setTimeout(() => {
        const mockResponse = {
          status: 200,
          statusText: "OK",
          data: {
            message: "This is a mock response. In a real implementation, this would make an actual API call.",
            timestamp: new Date().toISOString(),
            endpoint: testRequest.url,
          },
        }
        setTestResponse(JSON.stringify(mockResponse, null, 2))
      }, 1000)
    } catch (error) {
      setTestResponse(`Error: ${error}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
          <p className="text-gray-600 mt-2">Interactive API reference and testing interface</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          v1.0.0
        </Badge>
      </div>

      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="testing">API Testing</TabsTrigger>
          <TabsTrigger value="examples">Code Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search endpoints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">API Endpoints</h3>
              {filteredEndpoints.map((endpoint) => (
                <Card
                  key={endpoint.id}
                  className={`cursor-pointer transition-colors ${
                    selectedEndpoint?.id === endpoint.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedEndpoint(endpoint)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getMethodColor(endpoint.method)}>{endpoint.method}</Badge>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{endpoint.path}</code>
                      </div>
                      {endpoint.authentication && (
                        <Badge variant="outline" className="text-xs">
                          <i className="fas fa-lock mr-1"></i>
                          Auth Required
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base">{endpoint.title}</CardTitle>
                    <CardDescription className="text-sm">{endpoint.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              {selectedEndpoint ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getMethodColor(selectedEndpoint.method)}>{selectedEndpoint.method}</Badge>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{selectedEndpoint.path}</code>
                    </div>
                    <CardTitle>{selectedEndpoint.title}</CardTitle>
                    <CardDescription>{selectedEndpoint.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Parameters</h4>
                        <div className="space-y-2">
                          {selectedEndpoint.parameters.map((param) => (
                            <div key={param.name} className="border rounded p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="text-sm font-mono">{param.name}</code>
                                <Badge variant="outline" className="text-xs">
                                  {param.type}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {param.location}
                                </Badge>
                                {param.required && (
                                  <Badge variant="destructive" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{param.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedEndpoint.requestBody && (
                      <div>
                        <h4 className="font-semibold mb-2">Request Body</h4>
                        <div className="border rounded p-3">
                          <p className="text-sm text-gray-600 mb-2">{selectedEndpoint.requestBody.description}</p>
                          <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                            <code>{selectedEndpoint.requestBody.example}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-2">Responses</h4>
                      <div className="space-y-2">
                        {selectedEndpoint.responses.map((response, index) => (
                          <div key={index} className="border rounded p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                className={
                                  response.status < 300 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }
                              >
                                {response.status}
                              </Badge>
                              <span className="text-sm">{response.description}</span>
                            </div>
                            <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                              <code>{response.example}</code>
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center text-gray-500">
                      <i className="fas fa-mouse-pointer text-4xl mb-4"></i>
                      <p>Select an endpoint to view details</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>How to authenticate with the API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Bearer Token Authentication</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Include your API token in the Authorization header of your requests.
                </p>
                <pre className="bg-gray-50 p-3 rounded text-sm">
                  <code>{`Authorization: Bearer your-api-token-here`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Getting an API Token</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Navigate to Settings → API Keys</li>
                  <li>Click "Generate New API Key"</li>
                  <li>Copy the generated token</li>
                  <li>Store it securely and include it in your requests</li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <div className="flex items-start gap-2">
                  <i className="fas fa-exclamation-triangle text-yellow-600 mt-0.5"></i>
                  <div>
                    <h5 className="font-semibold text-yellow-800">Security Note</h5>
                    <p className="text-sm text-yellow-700">
                      Keep your API tokens secure. Never expose them in client-side code or public repositories.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Testing Interface</CardTitle>
              <CardDescription>Test API endpoints directly from the documentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="method">HTTP Method</Label>
                  <Select
                    value={testRequest.method}
                    onValueChange={(value) => setTestRequest({ ...testRequest, method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="url">Endpoint URL</Label>
                  <Input
                    id="url"
                    placeholder="/api/devices"
                    value={testRequest.url}
                    onChange={(e) => setTestRequest({ ...testRequest, url: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="headers">Headers (JSON)</Label>
                <Textarea
                  id="headers"
                  rows={4}
                  value={testRequest.headers}
                  onChange={(e) => setTestRequest({ ...testRequest, headers: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>

              {(testRequest.method === "POST" || testRequest.method === "PUT" || testRequest.method === "PATCH") && (
                <div>
                  <Label htmlFor="body">Request Body (JSON)</Label>
                  <Textarea
                    id="body"
                    rows={6}
                    placeholder='{\n  "name": "Example Device",\n  "type": "server"\n}'
                    value={testRequest.body}
                    onChange={(e) => setTestRequest({ ...testRequest, body: e.target.value })}
                    className="font-mono text-sm"
                  />
                </div>
              )}

              <Button onClick={handleTestRequest} className="w-full">
                <i className="fas fa-play mr-2"></i>
                Send Request
              </Button>

              {testResponse && (
                <div>
                  <Label>Response</Label>
                  <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto border">
                    <code>{testResponse}</code>
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>JavaScript/Node.js</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                  <code>{`// Using fetch API
const response = await fetch('/api/devices', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your-token-here',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);

// Creating a new device
const newDevice = await fetch('/api/devices', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-token-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'New Server',
    type: 'server',
    location: 'Data Center A'
  })
});`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Python</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                  <code>{`import requests

# Get devices
headers = {
    'Authorization': 'Bearer your-token-here',
    'Content-Type': 'application/json'
}

response = requests.get('/api/devices', headers=headers)
devices = response.json()

# Create a new device
new_device = {
    'name': 'New Server',
    'type': 'server',
    'location': 'Data Center A'
}

response = requests.post(
    '/api/devices',
    headers=headers,
    json=new_device
)

if response.status_code == 201:
    print('Device created successfully')
    print(response.json())`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>cURL</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                  <code>{`# Get all devices
curl -X GET /api/devices \\
  -H "Authorization: Bearer your-token-here" \\
  -H "Content-Type: application/json"

# Create a new device
curl -X POST /api/devices \\
  -H "Authorization: Bearer your-token-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "New Server",
    "type": "server",
    "location": "Data Center A"
  }'`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>PHP</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                  <code>{`<?php
// Get devices
$headers = [
    'Authorization: Bearer your-token-here',
    'Content-Type: application/json'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/devices');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$devices = json_decode($response, true);

// Create a new device
$newDevice = [
    'name' => 'New Server',
    'type' => 'server',
    'location' => 'Data Center A'
];

curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($newDevice));

$response = curl_exec($ch);
curl_close($ch);
?>`}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
