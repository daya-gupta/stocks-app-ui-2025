const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

class ApiClient {
    private async getHeaders(): Promise<HeadersInit> {
    const access_token = localStorage.getItem('access_token')
    
    return {
      'Content-Type': 'application/json',
      ...(access_token && {
        'Authorization': `Bearer ${access_token}`
      })
    }
  }

  async get(endpoint: string): Promise<any> {
    const headers = await this.getHeaders()
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    })
    return response.json()
  }

  async post(endpoint: string, data: any): Promise<any> {
    const headers = await this.getHeaders()
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
    return response.json()
  }

  async put(endpoint: string, data: any): Promise<any> {
    const headers = await this.getHeaders()
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    })
    return response.json()
  }

  async delete(endpoint: string): Promise<any> {
    const headers = await this.getHeaders()
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    })
    return response.json()
  }

  async uploadFile(endpoint: string, file: File, additionalFields?: Record<string, any>): Promise<any> {
    const access_token = localStorage.getItem('access_token')
    const formData = new FormData()
    formData.append('file', file)
    
    // Add any additional fields
    if (additionalFields) {
      Object.entries(additionalFields).forEach(([key, value]) => {
        formData.append(key, value as string)
      })
    }

    const headers: HeadersInit = {}
    if (access_token) {
      headers['Authorization'] = `Bearer ${access_token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })
    return response.json()
  }
}

export const apiClient = new ApiClient()
