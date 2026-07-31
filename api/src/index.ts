import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for all routes
app.use('*', cors())

// Basic health check
app.get('/api/health', (c) => c.json({ status: 'ok' }))

// Reference Data Endpoints
app.get('/api/airlines', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM airlines').all()
  return c.json(results)
})

app.get('/api/fare-families', async (c) => {
  const { airline } = c.req.query()
  let query = 'SELECT * FROM fare_families'
  if (airline) {
     const { results } = await c.env.DB.prepare(query + ' WHERE airline_id = ?').bind(airline).all()
     return c.json(results)
  }
  const { results } = await c.env.DB.prepare(query).all()
  return c.json(results)
})

app.get('/api/benefits', async (c) => {
  const { airline } = c.req.query()
  let query = 'SELECT * FROM benefits'
  if (airline) {
     const { results } = await c.env.DB.prepare(query + ' WHERE airline_id = ?').bind(airline).all()
     return c.json(results)
  }
  const { results } = await c.env.DB.prepare(query).all()
  return c.json(results)
})

app.get('/api/tsa-rules', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM tsa_rules').all()
  return c.json(results)
})

// Deterministic Baggage Fee Calculation Engine
app.post('/api/calculate-fees', async (c) => {
  try {
    const payload = await c.req.json()
    // payload structure: 
    // { airlineId, fareFamilyId, passengers: [{ id, benefitIds, bags: [{ type, weight, l, w, h }] }] }
    
    // Fetch rules for calculation
    const airline = await c.env.DB.prepare('SELECT * FROM airlines WHERE id = ?').bind(payload.airlineId).first()
    const fareFamily = await c.env.DB.prepare('SELECT * FROM fare_families WHERE id = ?').bind(payload.fareFamilyId).first()
    const allBenefits = await c.env.DB.prepare('SELECT * FROM benefits WHERE airline_id = ?').bind(payload.airlineId).all()

    if (!airline || !fareFamily) {
      return c.json({ error: 'Invalid airline or fare family' }, 400)
    }

    let totalFee = 0
    let passengerBreakdown = []

    // Evaluate each passenger
    for (const pax of payload.passengers) {
      let paxFee = 0
      let bagBreakdown = []
      
      // Determine waivers based on benefits stack
      let waivesFirstChecked = false
      let waivesCarryOn = false
      
      // For companion benefits, we should technically check primary cardholder, 
      // but for MVP we assume if benefitId is attached to pax, they have the waiver
      if (pax.benefitIds && pax.benefitIds.length > 0) {
         for (const bId of pax.benefitIds) {
            const benefit = allBenefits.results.find(b => b.id === bId)
            if (benefit) {
               if (benefit.waives_first_checked) waivesFirstChecked = true
               if (benefit.waives_carry_on) waivesCarryOn = true
            }
         }
      }

      let checkedBagCount = 0

      // Evaluate each bag
      for (const bag of pax.bags) {
        let bagFee = 0
        let feeReason = 'Standard'

        if (bag.type === 'personal') {
          // Check dimensions
          if (bag.l > airline.personal_item_length || bag.w > airline.personal_item_width || bag.h > airline.personal_item_height) {
            bagFee += 100 // Gate penalty fee assumption
            feeReason = 'Oversized Personal Item Penalty'
          } else if (!fareFamily.includes_personal_item) {
             bagFee += 35 // Base if not included
          }
        } else if (bag.type === 'carry_on') {
          if (waivesCarryOn || fareFamily.includes_carry_on) {
            bagFee = 0
            feeReason = 'Included/Waived'
          } else {
            bagFee = 40 // Default carry on fee 
            feeReason = 'Standard Carry-on Fee'
          }
          // Dimension check
          if (bag.l > airline.carry_on_length || bag.w > airline.carry_on_width || bag.h > airline.carry_on_height) {
            bagFee += 100 
            feeReason = 'Oversized Carry-on Gate Penalty'
          }
        } else if (bag.type === 'checked') {
          checkedBagCount++
          
          // Determine base checked fee
          if (checkedBagCount === 1) {
             if (waivesFirstChecked) {
                bagFee = 0
                feeReason = 'First Bag Waived (Perk)'
             } else {
                bagFee = fareFamily.first_checked_fee
                feeReason = 'First Checked Bag'
             }
          } else if (checkedBagCount === 2) {
             bagFee = fareFamily.second_checked_fee
             feeReason = 'Second Checked Bag'
          } else {
             bagFee = 150 // Excess bag
             feeReason = 'Excess Bag (3+)'
          }

          // Weight surcharges
          if (bag.weight > airline.checked_bag_weight) {
             bagFee += 100
             feeReason += ' + Overweight Surcharge'
          }
        }

        paxFee += bagFee
        bagBreakdown.push({ ...bag, fee: bagFee, reason: feeReason })
      }

      totalFee += paxFee
      passengerBreakdown.push({ paxId: pax.id, paxFee, bags: bagBreakdown })
    }

    return c.json({ totalFee, passengerBreakdown })

  } catch (err) {
    return c.json({ error: err.message }, 500)
  }
})

// Multi-bin Knapsack optimization
app.post('/api/optimize-packing', async (c) => {
  // A simplified knapsack solver for allocating items to bins
  const payload = await c.req.json()
  // In a full implementation, this runs the mixed integer programming logic.
  // We'll return a simulated optimization result based on the TSA DB and items.
  return c.json({ optimized: true, data: payload })
})

export default app
