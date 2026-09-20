import axios, { AxiosError } from "axios"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1"
const withCredentials = import.meta.env.VITE_API_WITH_CREDENTIALS !== "false"

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
  withCredentials
})

let isHandlingUnauthorized = false

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !isHandlingUnauthorized) {
      isHandlingUnauthorized = true
      window.dispatchEvent(new CustomEvent("ecalendar:unauthorized"))
      window.setTimeout(() => {
        isHandlingUnauthorized = false
      }, 1000)
    }

    return Promise.reject(error)
  }
)

export function getApiBaseUrl() {
  return apiBaseUrl
}
