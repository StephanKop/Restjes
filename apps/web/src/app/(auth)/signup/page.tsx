'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function SignupPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })

    if (error) {
      switch (error.message) {
        case 'User already registered':
          setError('Er bestaat al een account met dit e-mailadres.')
          break
        case 'Password should be at least 6 characters':
          setError('Je wachtwoord moet minimaal 6 tekens bevatten.')
          break
        default:
          setError('Er is iets misgegaan. Probeer het opnieuw.')
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold text-warm-800">Bijna klaar!</h1>
        <p className="text-warm-600">
          Check je e-mail om je account te bevestigen!
        </p>
      </div>
    )
  }

  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold text-warm-800">
        Maak een account aan
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Naam"
          type="text"
          placeholder="Je naam"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        <Input
          label="E-mailadres"
          type="email"
          placeholder="jouw@email.nl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Wachtwoord"
          type="password"
          placeholder="Minimaal 6 tekens"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" variant="primary" loading={loading} className="w-full">
          Account aanmaken
        </Button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm">
        <p className="text-warm-500">
          Heb je al een account?{' '}
          <Link
            href="/login"
            className="text-brand-600 hover:text-brand-700 font-semibold"
          >
            Inloggen
          </Link>
        </p>
      </div>
    </>
  )
}
