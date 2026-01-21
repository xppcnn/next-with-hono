'use client'
import { useEffect, useState } from 'react'
import { useAuth } from "@/hooks/useAuth"  
export default function Home() {
  const [message, setMessage] = useState()

  const { user } =   useAuth()
  if (!user) return <p>Loading...</p>

  return <p className='text-2xl text-red-500'>{user.name}</p>
}
