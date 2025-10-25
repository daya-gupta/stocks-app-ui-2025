import { createClient } from './supabase'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

class ApiClient {
  private async getHeaders(): Promise<HeadersInit> {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    return {
      'Content-Type': 'application/json',
      ...(session?.access_token && {
        'Authorization': `Bearer ${session.access_token}`
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
}

export const apiClient = new ApiClient()
