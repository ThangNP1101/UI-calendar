import { useCallback, useEffect, useState } from "react"
import CalendarApp from "./App"
import { AuthProvider, useAuth } from "./auth/auth.context"
import { CallbackPage } from "./auth/routes/CallbackPage"
import { LoginPage } from "./auth/routes/LoginPage"

function getCurrentPath() {
  return window.location.pathname
}

function navigate(path: string) {
  window.history.pushState({}, "", path)
  window.dispatchEvent(new PopStateEvent("popstate"))
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { config, status } = useAuth()

  useEffect(() => {
    if (config.authEnabled && status === "unauthenticated") {
      navigate("/auth/login")
    }
  }, [config.authEnabled, status])

  if (!config.authEnabled) return children

  if (status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#eef2f1] text-sm text-[#56635c]">
        Đang kiểm tra phiên đăng nhập...
      </main>
    )
  }

  if (status !== "authenticated") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#eef2f1] text-sm text-[#56635c]">
        Đang chuyển hướng đăng nhập...
      </main>
    )
  }

  return children
}

function RoutedApp() {
  const [path, setPath] = useState(getCurrentPath)
  const handleNavigate = useCallback((nextPath: string) => navigate(nextPath), [])

  useEffect(() => {
    function handlePopState() {
      setPath(getCurrentPath())
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  if (path === "/auth/login") return <LoginPage />
  if (path === "/auth/callback") return <CallbackPage onComplete={handleNavigate} />

  return (
    <RequireAuth>
      <CalendarApp />
    </RequireAuth>
  )
}

export default function RootApp() {
  return (
    <AuthProvider>
      <RoutedApp />
    </AuthProvider>
  )
}
