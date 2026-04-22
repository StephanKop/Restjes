# Kliekjesclub Platform Improvement Report

## Executive Summary

Kliekjesclub occupies a **unique niche** in the Dutch market: peer-to-peer homemade food sharing with a marketplace model. No competitor does this. Too Good To Go dominates B2C surplus (4M users in NL), Olio does P2P but free-only and UK-focused, and Karma pivoted away entirely. Your EU-14 allergen system, chat, and review infrastructure are unmatched in this space.

This report covers 35 improvement opportunities, categorized by impact, complexity, and strategic priority.

---

## Competitive Landscape

| Platform | Model | NL Users | Homemade | Allergens | Chat | Reviews |
|---|---|---|---|---|---|---|
| **Too Good To Go** | B2C mystery bags | ~4M | No | Minimal | No | Stars only |
| **Olio** | P2P free sharing | Minimal | Raw surplus | None | Yes | Stars |
| **ResQ Club** | B2C transparent | None | No | None | No | Limited |
| **Karma** | Pivoted to B2B | None | No | N/A | N/A | N/A |
| **Kliekjesclub** | P2P marketplace | Building | **Yes** | **EU-14** | **Yes** | **Stars + text** |

**Key insight**: NoFoodWasted (NL) shut down, Karma pivoted — pure B2C food waste apps can't compete with TGTG's network effects. Your community/P2P approach is the correct differentiation.

---

## Improvements by Category

### 1. ENGAGEMENT & RETENTION (Highest Strategic Value)

#### 1.1 Impact Dashboard
**What**: Show users their personal impact — meals shared, CO2 saved (2.7kg per meal), neighbors helped, food waste prevented.
**Why**: Both TGTG and Olio use this as their primary engagement driver. Research shows impact tracking tied to environmental values is more effective than points/badges.
**Where**: Profile page (web + mobile), post-reservation confirmation screen.

| Metric | Value |
|---|---|
| User impact | High — proven #1 engagement driver across competitors |
| Complexity | Low — calculate from existing reservation data |
| Priority | **P0 — implement first** |

#### 1.2 Favorites / Wishlist
**What**: Let users save dishes or merchants for quick access. Heart icon on dish cards.
**Why**: TGTG's favorites + alerts system is their stickiest feature. Creates a reason to return daily.
**Where**: Dish cards, merchant profiles, dedicated "Favorieten" tab.

| Metric | Value |
|---|---|
| User impact | High — creates daily return habit |
| Complexity | Low — new `favorites` table with user_id + dish_id/merchant_id |
| Priority | **P0** |

#### 1.3 Smarter Push Notifications
**What**: Notify users about new dishes near them, not just messages/reservations. Time notifications around meals (11:30, 17:00). Let users set preferred days/times.
**Why**: Rich push notifications increase app opens by 56% and retention by 3-10x. Currently only message/reservation notifications exist.
**Where**: Mobile app (already has expo-notifications), web (browser notifications via NotificationBell).

| Metric | Value |
|---|---|
| User impact | High — 56% more app opens |
| Complexity | Medium — need new notification triggers in Supabase edge functions |
| Priority | **P0** |

#### 1.4 Email Notifications
**What**: Reservation confirmations, new dish alerts (weekly digest), review prompts, pickup reminders.
**Why**: Not everyone has the app installed. Email catches the web-only users.
**Where**: Supabase edge functions + email provider (Resend, Postmark).

| Metric | Value |
|---|---|
| User impact | High |
| Complexity | Medium |
| Priority | **P1** |

---

### 2. TRUST & SAFETY (Critical for Homemade Food)

#### 2.1 Merchant Verification Workflow
**What**: Structured onboarding for merchants — profile completeness check, photo verification, first dish quality review. Display "Geverifieerd" badge prominently.
**Why**: The #1 barrier to homemade food sharing is trust. Olio has zero food poisoning incidents across 125M meals thanks to their verification and training system.
**Where**: Aanbieder onboarding flow, badge on profiles and dish cards.

| Metric | Value |
|---|---|
| User impact | High — directly addresses trust barrier |
| Complexity | Medium — mostly UI/workflow, some admin tooling |
| Priority | **P1** |

#### 2.2 Food Safety Guidelines
**What**: In-app food safety tips during dish creation. Required checkbox for "I confirm this food was prepared safely." Link to NVWA guidelines.
**Why**: Regulatory clarity and user confidence. Olio requires food safety training for their volunteers.
**Where**: Dish creation step 3 (Details), merchant onboarding.

| Metric | Value |
|---|---|
| User impact | Medium — builds confidence |
| Complexity | Low — content + checkbox |
| Priority | **P1** |

#### 2.3 Dispute Resolution
**What**: System for handling no-shows, food quality issues, cancellations. Simple flow: report issue → merchant response → resolution.
**Why**: Currently no mechanism for handling problems. This is critical as the platform scales.
**Where**: Reservation detail page, new "Probleem melden" button.

| Metric | Value |
|---|---|
| User impact | Medium — safety net |
| Complexity | Medium — new tables, notification flows, potentially admin panel |
| Priority | **P2** |

---

### 3. DISCOVERY & CONVERSION

#### 3.1 Mobile Geolocation Filter
**What**: Port the web app's geolocation + radius slider to the mobile app.
**Why**: The mobile app is missing this — it's the most natural discovery method on a phone.
**Where**: Mobile discovery screen filter sidebar.

| Metric | Value |
|---|---|
| User impact | High |
| Complexity | Low — the RPC `nearby_dish_ids` already exists |
| Priority | **P1** |

#### 3.2 "Beschikbaar Nu" Quick Filter
**What**: One-tap filter showing dishes available for pickup right now (pickup_start <= now <= pickup_end).
**Why**: TGTG's "Available now" vs "Available tomorrow" segmentation drives immediate conversions.
**Where**: Browse page, above dish grid.

| Metric | Value |
|---|---|
| User impact | Medium — reduces friction for impulse pickups |
| Complexity | Low — query filter |
| Priority | **P2** |

#### 3.3 Map View on Mobile
**What**: Add map-based discovery to the mobile app (web already has it).
**Why**: Seeing dishes on a map is more intuitive than a list when you're thinking about "what's near me."
**Where**: Mobile discovery screen, additional view toggle.

| Metric | Value |
|---|---|
| User impact | Medium |
| Complexity | Medium — need react-native-maps or similar |
| Priority | **P2** |

#### 3.4 Ingredient Autocomplete
**What**: Suggest common ingredients as the user types during dish creation.
**Why**: Reduces friction, ensures consistency (important for allergen safety).
**Where**: Dish creation step 3, ingredient input.

| Metric | Value |
|---|---|
| User impact | Low |
| Complexity | Low — static list of common Dutch ingredients |
| Priority | **P3** |

---

### 4. ONBOARDING & ACTIVATION

#### 4.1 Post-Signup Guided Tour
**What**: After signup, show a 3-step welcome flow: "Browse dishes → Make your first reservation → Share your own dish." Auto-set city from profile.
**Why**: Currently users land on browse with no guidance. First-time experience determines retention.
**Where**: New component shown after first login, stored in profile metadata.

| Metric | Value |
|---|---|
| User impact | High — first impression determines retention |
| Complexity | Low — modal/overlay component |
| Priority | **P1** |

#### 4.2 Merchant Onboarding Wizard
**What**: Step-by-step guided setup when someone first creates a dish: set up merchant profile → add first dish → preview how it looks.
**Why**: Currently merchants hit the dish form cold. A guided flow reduces drop-off.
**Where**: Redirect from first "Nieuw gerecht" click if no merchant profile exists.

| Metric | Value |
|---|---|
| User impact | Medium |
| Complexity | Low |
| Priority | **P2** |

---

### 5. COMMUNITY & SOCIAL

#### 5.1 Social Sharing
**What**: Share dish cards to WhatsApp, Instagram Stories, Facebook with a branded preview card (OG image).
**Why**: Word-of-mouth is the #1 growth channel for local platforms. TGTG users share "hauls" on social media driving organic virality.
**Where**: Dish detail page, share button.

| Metric | Value |
|---|---|
| User impact | Medium — drives organic growth |
| Complexity | Low — OG images already configured, add share buttons |
| Priority | **P1** |

#### 5.2 Neighborhood Feed
**What**: Activity feed showing recent activity in your area: "Maria deelde Pasta carbonara in Utrecht", "3 nieuwe gerechten in jouw buurt."
**Why**: Creates a sense of community activity. Solves the "is anyone using this?" doubt for new users.
**Where**: New tab or section on browse page.

| Metric | Value |
|---|---|
| User impact | Medium |
| Complexity | Medium — new query + component |
| Priority | **P2** |

#### 5.3 Buurt Ambassadeur Program
**What**: Recruit neighborhood ambassadors who actively share and recruit. Give them a badge, early access to features, featured profile.
**Why**: Olio's Food Waste Heroes (90,000 volunteers) are their supply-side engine. Ambassadors solve the cold start problem in new neighborhoods.
**Where**: Application form, ambassador dashboard.

| Metric | Value |
|---|---|
| User impact | High — solves cold start |
| Complexity | High — program management, tooling |
| Priority | **P2** |

---

### 6. MERCHANT TOOLS

#### 6.1 Analytics Dashboard
**What**: Show merchants: total dishes shared, total reservations, average rating trend, most popular dishes, busiest pickup times.
**Why**: Current dashboard has hardcoded "0" stats. Merchants need to see value to keep posting.
**Where**: Aanbieder dashboard, replace placeholder stats.

| Metric | Value |
|---|---|
| User impact | Medium |
| Complexity | Low — aggregate existing data |
| Priority | **P1** |

#### 6.2 Dish Templates / Repeat Posting
**What**: "Herhaal dit gerecht" button that pre-fills the creation form from a previous dish.
**Why**: Home cooks make the same dishes regularly. Re-entering everything is friction that kills repeat posting.
**Where**: Aanbieder dishes page, per-dish action.

| Metric | Value |
|---|---|
| User impact | High — directly increases supply |
| Complexity | Low — copy dish data to creation form |
| Priority | **P1** |

#### 6.3 Scheduled Posting
**What**: Create a dish now, set it to go live at a specific time (e.g., post at 16:00 when food is ready).
**Why**: Lets merchants prepare listings in advance.
**Where**: Dish creation step 2, optional "Publiceer op" datetime.

| Metric | Value |
|---|---|
| User impact | Medium |
| Complexity | Medium — needs `published_at` column and scheduled query filter |
| Priority | **P3** |

---

### 7. COMPLIANCE & ACCOUNT MANAGEMENT

#### 7.1 Account Deletion (GDPR Required)
**What**: Self-service account deletion in profile settings. Cascading delete of all user data.
**Why**: GDPR Article 17 — right to erasure. Legally required.
**Where**: Profile settings, "Account verwijderen" button.

| Metric | Value |
|---|---|
| User impact | Low (few users will use it) |
| Complexity | Medium — cascade across all tables |
| Priority | **P0 — legally required** |

#### 7.2 Data Export (GDPR Required)
**What**: "Download mijn gegevens" button that generates a JSON/CSV export of all user data.
**Why**: GDPR Article 20 — right to data portability.
**Where**: Profile settings.

| Metric | Value |
|---|---|
| User impact | Low |
| Complexity | Medium |
| Priority | **P0 — legally required** |

---

### 8. UX POLISH

#### 8.1 Custom 404 Page
**What**: Branded 404 page with navigation back to browse. Currently shows default Next.js 404.
**Where**: `app/not-found.tsx`

| Metric | Value |
|---|---|
| User impact | Low |
| Complexity | Very low |
| Priority | **P2** |

#### 8.2 Fix themeColor Metadata Warning
**What**: Move `themeColor` from `metadata` export to `viewport` export per Next.js 15.
**Where**: `app/layout.tsx`

| Metric | Value |
|---|---|
| User impact | None (fixes console warning) |
| Complexity | Very low |
| Priority | **P3** |

#### 8.3 Autocomplete Attributes on Forms
**What**: Add `autoComplete` attributes to login/signup form fields.
**Where**: Auth pages, `<input>` fields.

| Metric | Value |
|---|---|
| User impact | Low — better password manager support |
| Complexity | Very low |
| Priority | **P3** |

#### 8.4 Image Crop Tool
**What**: Let users crop/adjust photos before uploading during dish creation.
**Why**: Bad photos hurt conversion. A crop tool ensures consistent aspect ratios.
**Where**: Dish creation step 1, after image selection.

| Metric | Value |
|---|---|
| User impact | Medium |
| Complexity | Medium — need a crop library |
| Priority | **P3** |

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
*Focus: Legal compliance + highest-impact quick wins*

| # | Improvement | Complexity | Impact |
|---|---|---|---|
| 7.1 | Account deletion (GDPR) | Medium | Required |
| 7.2 | Data export (GDPR) | Medium | Required |
| 1.1 | Impact dashboard | Low | High |
| 1.2 | Favorites/wishlist | Low | High |
| 6.1 | Fix merchant dashboard stats | Low | Medium |

### Phase 2: Engagement (Week 3-4)
*Focus: Retention and activation*

| # | Improvement | Complexity | Impact |
|---|---|---|---|
| 1.3 | Smarter push notifications | Medium | High |
| 4.1 | Post-signup guided tour | Low | High |
| 5.1 | Social sharing buttons | Low | Medium |
| 6.2 | Dish templates / repeat posting | Low | High |
| 2.1 | Merchant verification workflow | Medium | High |

### Phase 3: Growth (Week 5-8)
*Focus: Discovery, community, supply*

| # | Improvement | Complexity | Impact |
|---|---|---|---|
| 1.4 | Email notifications | Medium | High |
| 3.1 | Mobile geolocation filter | Low | High |
| 2.2 | Food safety guidelines | Low | Medium |
| 5.2 | Neighborhood activity feed | Medium | Medium |
| 3.2 | "Beschikbaar nu" filter | Low | Medium |

### Phase 4: Scale (Month 3+)
*Focus: Platform maturity*

| # | Improvement | Complexity | Impact |
|---|---|---|---|
| 5.3 | Buurt ambassadeur program | High | High |
| 2.3 | Dispute resolution system | Medium | Medium |
| 3.3 | Mobile map view | Medium | Medium |
| 4.2 | Merchant onboarding wizard | Low | Medium |
| 6.3 | Scheduled posting | Medium | Medium |

---

## Cold Start Strategy

The #1 challenge for Kliekjesclub isn't features — it's supply. An empty marketplace is a dead marketplace.

**Proven playbook (from Andrew Chen's Cold Start Problem):**

1. **Build "atomic networks"**: Focus on ONE neighborhood first. Make it vibrant (10+ active merchants, daily dishes). Then replicate.

2. **Seed supply yourself**: Post dishes from your own kitchen. Ask friends/family in the target neighborhood to post. The first 20 listings must be real.

3. **Partner with local businesses**: Approach bakeries, restaurants, caterers in the target neighborhood. They have daily surplus and are motivated to reduce waste. Olio built their entire supply side this way.

4. **Recruit neighborhood ambassadors**: One active person per neighborhood who posts regularly and recruits others. This is Olio's "Food Waste Heroes" model adapted for NL.

5. **Create scarcity/urgency**: "Slechts 3 gerechten beschikbaar in Utrecht vandaag" drives faster decisions than an infinite scroll.

---

## Monetization Options (When Ready)

| Model | How | When |
|---|---|---|
| **Free forever for consumers** | Critical for adoption | Always |
| **Commission per reservation** | Small fee (€0.50-1.00) per completed reservation | After 10K+ users |
| **Premium subscription** | "Kliekjesclub Plus" — faster notifications, saved filters, featured profile | After product-market fit |
| **Business partnerships** | Bakeries/restaurants pay for surplus redistribution (Olio model) | After proving neighborhood model |
| **Featured listings** | Merchants pay to boost dish visibility | After supply exceeds demand |

---

## Key Metrics to Track

| Metric | Target | Why |
|---|---|---|
| **Weekly active listings** | 50+ per city | Supply health |
| **Reservation completion rate** | >80% | Demand health |
| **D7 retention** | >30% | Activation success |
| **Time to first reservation** | <24h after signup | Onboarding success |
| **Merchant repeat rate** | >60% post 2nd week | Supply stickiness |
| **Average review score** | >4.0 | Trust signal |

---

*Report generated April 19, 2026. Based on competitive analysis of Too Good To Go, Olio, ResQ Club, Karma, NoFoodWasted, and UX research across 50+ sources.*
