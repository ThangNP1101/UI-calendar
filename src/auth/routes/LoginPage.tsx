import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { buildAuthorizationUrl } from "../auth.service"

export function LoginPage() {
  const hasStarted = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    async function startLogin() {
      try {
        const authorizationUrl = await buildAuthorizationUrl()
        window.location.href = authorizationUrl
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Could not start SSO login.")
      }
    }

    void startLogin()
  }, [])

  return (
    <main className="grid min-h-screen place-items-center bg-[#eef2f1] px-4">
      <section className="w-full max-w-md rounded-[10px] bg-white p-6 shadow-lg">
        <h1 className="text-lg font-bold text-[#23322b]">Đăng nhập Signet</h1>
        <p className="mt-2 text-sm text-[#6f7d76]">
          Đang chuẩn bị chuyển hướng đến Signet SSO bằng PKCE.
        </p>
        {error ? (
          <div className="mt-4 rounded-[6px] border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {error ? (
          <Button className="mt-4 bg-[#118b5b] text-white hover:bg-[#087048]" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        ) : null}
      </section>
    </main>
  )
}
