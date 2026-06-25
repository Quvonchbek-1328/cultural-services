# Cultural Services 🎭

Uzbekistan's marketplace connecting **event organizers** with verified **cultural service providers** — singers, dance groups, MCs, musicians, photographers, videographers, sound engineers, stage decorators and transportation. Think Airbnb-style discovery × Upwork-style marketplace × Eventbrite-style event management.

Production-ready **frontend MVP** built with the App Router.

## Tech stack
- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4** (CSS-first `@theme` design system)
- shadcn-style UI primitives (cva + tailwind-merge) — no Radix runtime
- **Framer Motion** animations
- **React Hook Form + Zod** (multi-step event wizard)
- **Zustand** state (auth/role, marketplace filters, events, proposals)
- **Recharts** dashboards · **Lucide** icons

## Brand
| Token | Value |
|------|------|
| Primary (teal) | `#0F766E` |
| Secondary (blue) | `#1D4ED8` |
| Accent (amber) | `#F59E0B` |
| Background | `#F8FAFC` |

Subtle Uzbek motifs (suzani dot-grid, star tiles) are used as decorative accents.

## Getting started
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (76 routes)
```

## Routes
| Route | Description |
|------|------|
| `/` | Landing: hero + search, categories, featured providers, festivals, how-it-works, testimonials |
| `/marketplace` | Discovery with category/region/price/rating/availability filters, sort, grid/list, skeletons |
| `/providers/[id]` | Profile: cover, portfolio lightbox, services, pricing, availability calendar, reviews, Book Now |
| `/booking/new` | Booking: event details, contract preview, payment summary, confirm |
| `/dashboard/organizer` | Overview + My Events, Create Event (4-step wizard), Proposals, Bookings, Messages, Settings |
| `/dashboard/provider` | Overview + Portfolio, Pricing, Availability, Requests, Bookings, Settings |
| `/dashboard/admin` | Metrics + Providers, Organizers, Categories, Reports moderation |

Use the **role switcher** (top-right) to jump between Organizer / Provider / Admin views — no auth needed (frontend MVP).

## Structure
```
src/
  app/                 # App Router pages
  components/
    ui/                # primitives (button, card, badge, input, tabs, dialog…)
    shared/            # ProviderCard, EventCard, ProposalCard, DataTable, EmptyState…
    layout/            # Navbar, Footer, DashboardShell + sidebar, RoleSwitcher
    landing/           # hero, how-it-works, stats, testimonials, cta
    marketplace/       # filter panel
    provider/          # gallery, calendar, pricing, book-now dialog
  lib/
    types.ts           # domain interfaces
    constants.ts       # categories, regions, event types
    utils.ts           # cn, formatUZS, dates
    mock/              # deterministic seeded dataset (providers, events, proposals, bookings…)
    store/             # zustand stores
```

All data is mocked/seeded deterministically (seeded PRNG) so server and client renders match.
