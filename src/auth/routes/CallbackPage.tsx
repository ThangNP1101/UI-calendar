import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "../auth.context"
import { exchangeAuthorizationCode, resolveOAuthCallback } from "../auth.service"

export function CallbackPage({ onComplete }: { onComplete: (path: string) => void }) {
  const { markAuthenticated } = useAuth()
  const hasProcessed = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (hasProcessed.current) return
    hasProcessed.current = true

    async function processCallback() {
      try {
        const payload = resolveOAuthCallback(window.location.search)
        window.history.replaceState({}, document.title, "/auth/callback")
        const session = await exchangeAuthorizationCode(payload)
        markAuthenticated(session)
        onComplete("/")
      } catch (caughtError) {
        window.history.replaceState({}, document.title, "/auth/callback")
        setError(caughtError instanceof Error ? caughtError.message : "Could not complete SSO login.")
      }
    }

    void processCallback()
  }, [markAuthenticated, onComplete])

  return (
    <main className="grid min-h-screen place-items-center bg-[#eef2f1] px-4">
      <section className="w-full max-w-md rounded-[10px] bg-white p-6 shadow-lg">
        <h1 className="text-lg font-bold text-[#23322b]">Hoàn tất đăng nhập</h1>
        <p className="mt-2 text-sm text-[#6f7d76]">Đang xác thực mã ủy quyền với backend.</p>
        {error ? (
          <div className="mt-4 rounded-[6px] border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {error ? (
          <Button className="mt-4 bg-[#118b5b] text-white hover:bg-[#087048]" onClick={() => onComplete("/auth/login")}>
            Đăng nhập lại
          </Button>
        ) : null}
      </section>
    </main>
  )
}
