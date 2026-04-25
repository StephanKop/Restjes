'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SocialAuthButtons } from '@/components/SocialAuthButtons'

export default function LoginPage() {
  const t = useTranslations('auth')
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
          setError(t('login.errors.invalidCredentials'))
          break
        case 'Email not confirmed':
          setError(t('login.errors.emailNotConfirmed'))
          break
        default:
          setError(t('login.errors.generic'))
      }
      setLoading(false)
      return
    }

    window.location.href = '/browse'
  }

  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold text-warm-800">
        {t('login.heading')}
      </h1>

      <SocialAuthButtons />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-warm-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-cream px-3 text-warm-400">{t('divider')}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('fields.emailLabel')}
          type="email"
          placeholder={t('fields.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label={t('fields.passwordLabel')}
          type="password"
          placeholder={t('fields.passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" variant="primary" loading={loading} className="w-full">
          {t('login.submit')}
        </Button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm">
        <p>
          <Link
            href="/forgot-password"
            className="text-brand-600 hover:text-brand-700 font-semibold"
          >
            {t('login.forgotPassword')}
          </Link>
        </p>
        <p className="text-warm-500">
          {t('login.noAccount')}{' '}
          <Link
            href="/signup"
            className="text-brand-600 hover:text-brand-700 font-semibold"
          >
            {t('login.signUpLink')}
          </Link>
        </p>
      </div>
    </>
  )
}
