'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')
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
      setError(t('forgotPassword.errors.generic'))
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold text-warm-800">{t('forgotPassword.success.heading')}</h1>
        <p className="text-warm-600">
          {t('forgotPassword.success.body')}
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          {t('forgotPassword.backToLogin')}
        </Link>
      </div>
    )
  }

  return (
    <>
      <h1 className="mb-2 text-center text-2xl font-bold text-warm-800">
        {t('forgotPassword.heading')}
      </h1>
      <p className="mb-6 text-center text-sm text-warm-500">
        {t('forgotPassword.subtext')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('fields.emailLabel')}
          type="email"
          placeholder={t('fields.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" variant="primary" loading={loading} className="w-full">
          {t('forgotPassword.submit')}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link
          href="/login"
          className="text-brand-600 hover:text-brand-700 font-semibold"
        >
          {t('forgotPassword.backToLogin')}
        </Link>
      </div>
    </>
  )
}
