import { Redirect } from 'expo-router'

// This screen is never shown — the tab press is intercepted in _layout.tsx
// to navigate to /dish/create instead.
export default function CreatePlaceholder() {
  return <Redirect href="/dish/create" />
}
