'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/callback`,
    })

    if (error) {
      setError('Er is iets misgegaan. Probeer het opnieuw.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold text-warm-800">Check je e-mail</h1>
        <p className="text-warm-600">
          We hebben je een link gestuurd om je wachtwoord te resetten.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          Terug naar inloggen
        </Link>
      </div>
    )
  }

  return (
    <>
      <h1 className="mb-2 text-center text-2xl font-bold text-warm-800">
        Wachtwoord vergeten?
      </h1>
      <p className="mb-6 text-center text-sm text-warm-500">
        Vul je e-mailadres in en we sturen je een link om je wachtwoord te resetten.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="E-mailadres"
          type="email"
          placeholder="jouw@email.nl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" variant="primary" loading={loading} className="w-full">
          Verstuur reset link
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link
          href="/login"
          className="text-brand-600 hover:text-brand-700 font-semibold"
        >
          Terug naar inloggen
        </Link>
      </div>
    </>
  )
}
