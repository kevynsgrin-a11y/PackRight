import { Link, NavLink, Route, Routes } from 'react-router-dom'
import { PlaneTakeoff } from 'lucide-react'

import SeoHead from './components/SeoHead'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Airlines from './pages/Airlines'
import AirlineDetail from './pages/AirlineDetail'
import CarryOnSizeChecker from './pages/CarryOnSizeChecker'
import PersonalItemComparison from './pages/PersonalItemComparison'
import HowBaggageFeesWork from './pages/HowBaggageFeesWork'
import Methodology from './pages/Methodology'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import AffiliateDisclosure from './pages/AffiliateDisclosure'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

const NAV = [
  { to: '/airlines', label: 'Airlines' },
  { to: '/carry-on-size-checker', label: 'Size checker' },
  { to: '/how-baggage-fees-work', label: 'How fees work' },
  { to: '/methodology', label: 'Methodology' },
]

const FOOTER_LINKS = [
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/methodology', label: 'How estimates work' },
  { to: '/affiliate-disclosure', label: 'Affiliate disclosure' },
  { to: '/contact', label: 'Contact' },
]

function Header() {
  return (
    <header className="fixed top-0 w-full glass z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
        >
          <span className="bg-gradient-to-tr from-accent-primary to-accent-secondary p-2 rounded-xl">
            <PlaneTakeoff className="w-5 h-5 text-white" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold tracking-tight text-white">
            Pack<span className="text-accent-secondary">Right</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="flex gap-3 sm:gap-4 overflow-x-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'text-sm font-medium whitespace-nowrap transition-colors rounded px-1 py-1',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary',
                  isActive ? 'text-white' : 'text-text-muted hover:text-white',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          {FOOTER_LINKS.map((item) => (
            <Link
              key={item.to + item.label}
              to={item.to}
              className="text-sm text-text-muted hover:text-white transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="text-center text-sm text-text-muted space-y-2">
          <p>PackRight is the baggage-planning tool at Luggageliason.com.</p>
          <p className="max-w-2xl mx-auto">
            Fee estimates are not a quote. Airline size, weight and fee rules can change without
            notice. Confirm your allowance and final price with the airline before travel.
          </p>
          <p>&copy; {__BUILD_YEAR__} PackRight. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-premium-900 selection:bg-accent-primary/30">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-premium-800 focus:px-4 focus:py-2 focus:text-white focus:ring-2 focus:ring-accent-primary"
      >
        Skip to main content
      </a>

      <SeoHead />
      <ScrollToTop />

      {/* Background ambient glows */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 bg-accent-primary/20 rounded-full blur-[128px] -z-10 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/20 rounded-full blur-[128px] -z-10 pointer-events-none"
        aria-hidden="true"
      />

      <Header />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto"
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/airlines" element={<Airlines />} />
          <Route path="/airlines/:slug/baggage-fees" element={<AirlineDetail />} />
          <Route path="/carry-on-size-checker" element={<CarryOnSizeChecker />} />
          <Route path="/personal-item-size-comparison" element={<PersonalItemComparison />} />
          <Route path="/how-baggage-fees-work" element={<HowBaggageFeesWork />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/affiliate-disclosure" element={<AffiliateDisclosure />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
