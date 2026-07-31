import React, { useState, useEffect, useCallback } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import type { DropResult } from '@hello-pangea/dnd'
import FeeMatrix from '../components/FeeMatrix'
import KnapsackAllocator from '../components/KnapsackAllocator'
import MonetizationBanner from '../components/MonetizationBanner'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [airlines, setAirlines] = useState<any[]>([])
  const [fareFamilies, setFareFamilies] = useState<any[]>([])
  const [benefits, setBenefits] = useState<any[]>([])
  
  const [airlineId, setAirlineId] = useState('aa')
  const [fareFamilyId, setFareFamilyId] = useState('aa-basic')
  const [passengersCount, setPassengersCount] = useState(1)
  const [benefitId, setBenefitId] = useState('')
  
  const [calculationResult, setCalculationResult] = useState<any>(null)

  // Interactive packing state
  const [bins, setBins] = useState<any>({
    personal: { items: [{ id: 'i1', name: 'Laptop', weight: 5, tsa: 'safe' }] },
    carry_on: { items: [
      { id: 'i2', name: 'Weekend Clothes', weight: 15, tsa: 'safe' },
      { id: 'i3', name: 'Shampoo >3.4oz', weight: 2, tsa: 'checked_only' }
    ]},
    checked: { items: [] }
  })

  useEffect(() => {
    Promise.all([
      fetch('https://packright-api.kevynsgrin.workers.dev/api/airlines').then(res => res.json()),
      fetch('https://packright-api.kevynsgrin.workers.dev/api/fare-families').then(res => res.json()),
      fetch('https://packright-api.kevynsgrin.workers.dev/api/benefits').then(res => res.json())
    ]).then(([airlinesData, faresData, benefitsData]) => {
      setAirlines(airlinesData || [])
      setFareFamilies(faresData || [])
      setBenefits(benefitsData || [])
    }).catch(err => console.error('Failed to load reference data:', err))
  }, [])

  const calculateFees = useCallback(async () => {
    if (!fareFamilyId) return;
    setLoading(true)
    
    // Convert interactive bin state to the API payload bags array
    // Assuming standard dimensions for the bins for MVP
    const bags: any[] = []
    
    if (bins.personal.items.length > 0) {
      const w = bins.personal.items.reduce((s:number, i:any) => s + i.weight, 0)
      bags.push({ type: 'personal', weight: w, l: 15, w: 10, h: 5 })
    }
    if (bins.carry_on.items.length > 0) {
      const w = bins.carry_on.items.reduce((s:number, i:any) => s + i.weight, 0)
      bags.push({ type: 'carry_on', weight: w, l: 22, w: 14, h: 9 })
    }
    // For checked bags, we assume 1 bag if there are items. 
    // In a real app we'd split into multiple checked bags if weight > 50.
    if (bins.checked.items.length > 0) {
      const w = bins.checked.items.reduce((s:number, i:any) => s + i.weight, 0)
      bags.push({ type: 'checked', weight: w, l: 25, w: 15, h: 10 })
    }

    const passengers = Array.from({ length: passengersCount }).map((_, i) => ({
      id: `pax-${i+1}`,
      benefitIds: i === 0 && benefitId ? [benefitId] : [],
      bags: bags // applies same loadout to everyone for mvp
    }))

    try {
      const res = await fetch('https://packright-api.kevynsgrin.workers.dev/api/calculate-fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ airlineId, fareFamilyId, passengers })
      })
      const data = await res.json()
      setCalculationResult(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [airlineId, fareFamilyId, passengersCount, benefitId, bins])

  // Reactively calculate fees when constraints or packing bins change
  useEffect(() => {
    calculateFees()
  }, [calculateFees])

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const startBin = bins[source.droppableId];
    const finishBin = bins[destination.droppableId];
    
    if (startBin === finishBin) {
      const newItems = Array.from(startBin.items);
      const [removed] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, removed);
      
      setBins({
        ...bins,
        [source.droppableId]: { items: newItems }
      });
    } else {
      const startItems = Array.from(startBin.items);
      const finishItems = Array.from(finishBin.items);
      const [removed] = startItems.splice(source.index, 1);
      finishItems.splice(destination.index, 0, removed);
      
      setBins({
        ...bins,
        [source.droppableId]: { items: startItems },
        [destination.droppableId]: { items: finishItems }
      });
    }
  }

  const filteredFares = fareFamilies.filter(f => f.airline_id === airlineId)
  const filteredBenefits = benefits.filter(b => b.airline_id === airlineId)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-panel p-6">
          <h1 className="text-2xl font-bold mb-6 gradient-text">Plan Your Trip</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Airline</label>
              <div className="relative">
                <select 
                  value={airlineId} 
                  onChange={(e) => {
                    setAirlineId(e.target.value)
                    setFareFamilyId('')
                    setBenefitId('')
                  }}
                  className="w-full bg-premium-900 border border-white/10 rounded-xl py-2.5 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-accent-primary text-white"
                >
                  {airlines.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-3 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Fare Family</label>
              <div className="relative">
                <select 
                  value={fareFamilyId} 
                  onChange={(e) => setFareFamilyId(e.target.value)}
                  className="w-full bg-premium-900 border border-white/10 rounded-xl py-2.5 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-accent-primary text-white"
                >
                  <option value="" disabled>Select a fare family...</option>
                  {filteredFares.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-3 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Passengers</label>
              <input 
                type="number" 
                min="1" 
                max="9"
                value={passengersCount}
                onChange={(e) => setPassengersCount(parseInt(e.target.value) || 1)}
                className="w-full bg-premium-900 border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-accent-primary text-white" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Status / Credit Cards (Optional)</label>
              <div className="relative">
                <select 
                  value={benefitId}
                  onChange={(e) => setBenefitId(e.target.value)}
                  className="w-full bg-premium-900 border border-white/10 rounded-xl py-2.5 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-accent-primary text-white"
                >
                  <option value="">None</option>
                  {filteredBenefits.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-3 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-6">
        <div className="relative">
          {loading && (
            <div className="absolute top-2 right-2 p-1 bg-premium-800 rounded-full shadow border border-white/10 z-10">
              <div className="w-4 h-4 border-2 border-white/30 border-t-accent-primary rounded-full animate-spin" />
            </div>
          )}
          <FeeMatrix result={calculationResult} />
        </div>
        <KnapsackAllocator result={calculationResult} bins={bins} onDragEnd={onDragEnd} />
        <MonetizationBanner result={calculationResult} bins={bins} />
      </div>
    </div>
  )
}
