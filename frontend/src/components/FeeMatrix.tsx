import React from 'react'
import { Briefcase, Info } from 'lucide-react'

export default function FeeMatrix({ result }: { result: any }) {
  if (!result) {
    return (
      <div className="glass-panel p-6 flex items-center justify-center min-h-[300px] text-text-muted">
        <div className="text-center">
          <Briefcase className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p>Fill out your itinerary to calculate exact baggage fees.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-premium-700 rounded-lg">
            <Briefcase className="w-5 h-5 text-accent-primary" />
          </div>
          <h2 className="text-xl font-semibold">Baggage Fee Estimate</h2>
        </div>
        <div className="text-right">
          <div className="text-sm text-text-muted">Total Trip Fees</div>
          <div className="text-2xl font-bold text-white">${result.totalFee}</div>
        </div>
      </div>

      <div className="space-y-4">
        {result.passengerBreakdown?.map((pax: any, index: number) => (
          <div key={index} className="bg-premium-700/50 rounded-xl p-4 border border-white/5">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
              <h3 className="font-medium text-white">Passenger {index + 1}</h3>
              <span className="text-lg font-bold">${pax.paxFee}</span>
            </div>
            
            <div className="space-y-3 text-sm text-text-muted">
              {pax.bags.map((bag: any, bIndex: number) => (
                <div key={bIndex} className="flex justify-between items-start">
                  <div>
                    <span className="capitalize text-white mr-2">{bag.type.replace('_', ' ')}</span>
                    <span className="text-xs">
                      ({bag.weight}lbs, {bag.l}x{bag.w}x{bag.h}")
                    </span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className={bag.fee === 0 ? "text-green-400 font-medium" : "text-white font-medium"}>
                      ${bag.fee}
                    </span>
                    <span className="text-xs text-text-muted opacity-80 mt-0.5 max-w-[150px] leading-tight">
                      {bag.reason}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-accent-primary shrink-0" />
          <p className="text-sm text-accent-primary/90">
            Based on DOT rule 2026-13450, gate penalties for oversized items are strictly enforced. We calculate based on the highest risk factor.
          </p>
        </div>
      </div>
    </div>
  )
}
