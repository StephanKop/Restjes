'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SocialAuthButtons } from '@/components/SocialAuthButtons'

export default function SignupPage() {
  const t = useTranslations('auth')
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
          setError(t('signup.errors.alreadyRegistered'))
          break
        case 'Password should be at least 6 characters':
          setError(t('signup.errors.passwordTooShort'))
          break
        default:
          setError(t('signup.errors.generic'))
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
        <h1 className="mb-4 text-2xl font-bold text-warm-800">{t('signup.success.heading')}</h1>
        <p className="text-warm-600">
          {t('signup.success.body')}
        </p>
      </div>
    )
  }

  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold text-warm-800">
        {t('signup.heading')}
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
          label={t('fields.nameLabel')}
          type="text"
          placeholder={t('fields.namePlaceholder')}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
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
          placeholder={t('fields.passwordPlaceholderMin')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" variant="primary" loading={loading} className="w-full">
          {t('signup.submit')}
        </Button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm">
        <p className="text-warm-500">
          {t('signup.haveAccount')}{' '}
          <Link
            href="/login"
            className="text-brand-600 hover:text-brand-700 font-semibold"
          >
            {t('signup.loginLink')}
          </Link>
        </p>
      </div>
    </>
  )
}
