import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { PlaneTakeoff } from 'lucide-react'
import Home from './pages/Home'

function App() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-premium-900 selection:bg-accent-primary/30">
      {/* Background ambient glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-primary/20 rounded-full blur-[128px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/20 rounded-full blur-[128px] -z-10 pointer-events-none" />
      
      <header className="fixed top-0 w-full glass z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-accent-primary to-accent-secondary p-2 rounded-xl">
              <PlaneTakeoff className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Pack<span className="text-accent-secondary">Right</span>
            </span>
          </div>
          <nav className="flex gap-4">
             {/* MVP nav links */}
             <a href="#" className="text-sm font-medium text-text-muted hover:text-white transition-colors">Airlines</a>
             <a href="#" className="text-sm font-medium text-text-muted hover:text-white transition-colors">Pro</a>
          </nav>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>

      <footer className="border-t border-white/5 py-8 mt-auto glass">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-text-muted">
          &copy; {new Date().getFullYear()} PackRight. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default App
