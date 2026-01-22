import { redirect } from 'next/navigation'
import { headers } from "next/headers";
import { useAuth } from "@/hooks/useAuth"
import { auth } from "@/lib/auth"
export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (session?.user) return redirect("/dashboard")
  if (!session?.user) return redirect("/sign-in")
  return <p>Loading...</p>
}
