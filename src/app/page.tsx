"use client"

import { useEffect } from 'react'

export default function RootPage() {
  useEffect(() => {
    // Redirect to the new admin dashboard
    window.location.href = '/admin'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <p className="text-white">Redirecting to admin dashboard...</p>
      </div>
    </div>
  )
}
