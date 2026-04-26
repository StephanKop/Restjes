import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { supabase } from './supabase'

WebBrowser.maybeCompleteAuthSession()

function parseRedirectParams(url: string): Record<string, string> {
  const parsed = new URL(url)
  const out: Record<string, string> = {}
  parsed.searchParams.forEach((value, key) => (out[key] = value))
  if (parsed.hash && parsed.hash.length > 1) {
    const hashParams = new URLSearchParams(parsed.hash.slice(1))
    hashParams.forEach((value, key) => (out[key] = value))
  }
  return out
}

export type OAuthResult =
  | { ok: true }
  | { ok: false; reason: 'start' | 'cancelled' | 'session' }

// Shared handler for native OAuth sign-in. Supports both PKCE (code) and
// implicit (access_token/refresh_token) flows returned by Supabase.
export async function signInWithOAuthNative(
  provider: 'google' | 'apple',
): Promise<OAuthResult> {
  // Keep this path stable — it must exactly match a Redirect URL entry in
  // Supabase → Authentication → URL Configuration.
  const redirectTo = makeRedirectUri({ scheme: 'kliekjesclub', path: 'auth-callback' })

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  })

  if (error || !data.url) return { ok: false, reason: 'start' }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
  if (result.type !== 'success') return { ok: false, reason: 'cancelled' }

  const params = parseRedirectParams(result.url)
  const code = params.code
  const accessToken = params.access_token
  const refreshToken = params.refresh_token

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) return { ok: false, reason: 'session' }
    return { ok: true }
  }

  if (accessToken && refreshToken) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    if (sessionError) return { ok: false, reason: 'session' }
    return { ok: true }
  }

  return { ok: false, reason: 'session' }
}
