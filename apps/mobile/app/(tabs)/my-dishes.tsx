import { Redirect } from 'expo-router'

// Never shown — the tab press is intercepted in _layout.tsx to navigate
// to /aanbieder/dishes instead.
export default function MyDishesPlaceholder() {
  return <Redirect href="/aanbieder/dishes" />
}
