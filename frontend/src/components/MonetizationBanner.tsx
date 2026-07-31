import React from 'react'
import { ExternalLink, Tag } from 'lucide-react'

interface Props {
  result: any
  bins: any
}

export default function MonetizationBanner({ result, bins }: Props) {
  if (!result) return null;

  // Simple logic: if they have a checked bag, recommend Samsonite.
  // If they have carry on, recommend Travelpro.
  const hasCheckedBag = bins.checked.items.length > 0;
  const hasCarryOn = bins.carry_on.items.length > 0;
  
  // If they don't have checked, but they are getting hit with carry-on fees, recommend shipping/storage
  const carryOnFee = result.passengerBreakdown?.[0]?.bags?.find((b:any) => b.type === 'carry_on')?.fee > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
      {hasCarryOn && (
        <a href="#" className="glass-panel p-4 flex items-center justify-between hover:border-accent-primary/50 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-premium-700 rounded-lg group-hover:bg-accent-primary/20 transition-colors">
              <Tag className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Travelpro Platinum</h4>
              <p className="text-xs text-text-muted">Guaranteed to fit Sizer limits</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-white" />
        </a>
      )}

      {hasCheckedBag && (
        <a href="#" className="glass-panel p-4 flex items-center justify-between hover:border-accent-secondary/50 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-premium-700 rounded-lg group-hover:bg-accent-secondary/20 transition-colors">
              <Tag className="w-5 h-5 text-accent-secondary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Samsonite Freeform</h4>
              <p className="text-xs text-text-muted">Maximized lightweight hardside</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-white" />
        </a>
      )}
      
      {!hasCheckedBag && carryOnFee && (
        <a href="#" className="glass-panel p-4 flex items-center justify-between hover:border-yellow-500/50 transition-colors group sm:col-span-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-premium-700 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
              <Tag className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">LugLess Shipping</h4>
              <p className="text-xs text-text-muted">Ship your bag for less than the ${result.passengerBreakdown[0].paxFee} fee</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-white" />
        </a>
      )}
    </div>
  )
}
