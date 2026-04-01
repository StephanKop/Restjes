# Restjes - Implementation Phases

## Phase 1: Foundation - DONE
- [x] Turborepo monorepo setup with pnpm
- [x] Supabase project creation + 9 migrations (profiles, merchants, dishes, reviews, chat, reservations, RLS)
- [x] Auth flows: signup (consumer/merchant), login, logout, password reset
- [x] Profile pages, merchant onboarding form
- [x] Tailwind v4 design system (green/offwhite, Nunito, heavy rounding)
- [x] Shared UI package: Button, Input
- [x] Supabase cloud project linked, storage buckets created, TypeScript types generated
- [x] Next.js web app builds and deploys to Vercel

## Phase 2: Core Marketplace - DONE
- [x] Dish CRUD for merchants (create, edit, delete with image upload to Supabase Storage)
- [x] Ingredients tag input + EU-14 allergen multi-select
- [x] Browse page with full-text search (Dutch tsvector) + filters (vegetarian, vegan, allergen exclusion)
- [x] DishCard component with pickup time, badges, quantity
- [x] Dish detail page with full info, allergen badges, merchant card
- [x] Merchant public profile page with banner, logo, rating, dishes grid
- [x] Reservation flow: consumer reserves -> merchant confirms -> pickup
- [x] Reservation management pages for both consumer and merchant
- [x] Status badges, action buttons, tab filters
- [x] Merchant routes moved under /aanbieder/ prefix to avoid route conflicts

## Phase 3: Social Features - DONE
- [x] StarRating component (display + interactive modes)
- [x] ReviewForm with star rating + comment
- [x] ReviewList with avatar, rating, relative date
- [x] Rating distribution bar chart on merchant reviews page
- [x] Inline review on collected reservations
- [x] Merchant reviews dashboard page
- [x] Reviews section on merchant profile (latest 3 + link to all)
- [x] ChatThread with Supabase Realtime subscription (postgres_changes INSERT)
- [x] ConversationList with avatars, last message preview, unread badges
- [x] StartChatButton (start/resume from dish page)
- [x] Consumer + merchant message pages (list + thread)
- [x] Unread message count badge in consumer nav
- [x] Mark-as-read on conversation open

## Phase 4: Mobile App - DONE
- [x] Expo SDK 54 setup with Expo Router + NativeWind v4
- [x] Supabase client with SecureStore for token persistence
- [x] AuthProvider context with session management
- [x] Auth screens: login, signup (consumer + merchant) - all Dutch
- [x] Tab navigator: Ontdekken, Reserveringen, Berichten, Profiel
- [x] Browse screen with search, filter pills, FlatList of dish cards, pull-to-refresh
- [x] Dish detail with image, info cards, ingredients, allergens, reserve button
- [x] Merchant profile with rating, dishes, reviews
- [x] Reservations with segmented control (Actief/Afgerond/Geannuleerd), cancel action
- [x] Messages list with avatars, last message preview, unread badges
- [x] Chat with Supabase Realtime subscription, inverted FlatList, mark-as-read
- [x] Profile tab with sign out, merchant dashboard link
- [x] 14 screens total, zero TypeScript errors
- [ ] Push notifications via Expo Notifications (deferred to Phase 5)
- [ ] Image picker for dish photos (deferred to Phase 5)
- [ ] EAS Build + App Store submission (deferred to Phase 5)

## Phase 5: Polish & Launch - DONE
- [x] SEO: dynamic sitemap.ts, robots.ts, JSON-LD structured data (Product + FoodEstablishment)
- [x] OpenGraph metadata on dish detail and merchant profile pages
- [x] Edge Function: expire-dishes (cron - expires past-pickup dishes, marks sold-out as reserved)
- [x] Edge Function: on-reservation-placed (decrements quantity, updates dish status)
- [x] Edge Function: push-notification (sends Expo Push on new message)
- [x] Merchant onboarding/settings page (business info, logo upload, address, KVK)
- [x] JsonLd reusable component for structured data
- [ ] Sanity CMS (future: for marketing pages)
- [ ] Analytics (PostHog/Plausible)
- [ ] Error tracking (Sentry)
- [ ] Accessibility audit
- [ ] Legal pages (terms, privacy)
- [ ] EAS Build + App Store submission
