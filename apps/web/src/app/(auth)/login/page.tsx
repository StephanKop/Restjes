'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      switch (error.message) {
        case 'Invalid login credentials':
          setError('Onjuist e-mailadres of wachtwoord.')
          break
        case 'Email not confirmed':
          setError('Je e-mailadres is nog niet bevestigd. Check je inbox.')
          break
        default:
          setError('Er is iets misgegaan. Probeer het opnieuw.')
      }
      setLoading(false)
      return
    }

    router.push('/browse')
  }

  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold text-warm-800">
        Welkom terug!
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="Je wachtwoord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" variant="primary" loading={loading} className="w-full">
          Inloggen
        </Button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm">
        <p>
          <Link
            href="/forgot-password"
            className="text-brand-600 hover:text-brand-700 font-semibold"
          >
            Wachtwoord vergeten?
          </Link>
        </p>
        <p className="text-warm-500">
          Nog geen account?{' '}
          <Link
            href="/signup"
            className="text-brand-600 hover:text-brand-700 font-semibold"
          >
            Aanmelden
          </Link>
        </p>
      </div>
    </>
  )
}
