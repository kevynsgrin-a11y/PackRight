/**
 * Question and answer text for airline pages.
 *
 * Shared by the page (which renders these visibly) and by the FAQPage schema in
 * seo.ts, so the structured data can never describe questions a reader cannot
 * see. The audit was explicit: do not manufacture an FAQ schema block without
 * visible questions and answers.
 *
 * All wording is original and generated from PackRight's own data. No airline
 * policy text is reproduced.
 */

import type { Airline } from './data'
import { faresForAirline } from './data'
import { formatDimensions } from './format'

export interface FaqEntry {
  question: string
  answer: string
}

const money = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`

export function airlineFaqs(airline: Airline): FaqEntry[] {
  const entries: FaqEntry[] = []
  const unverified = 'This figure has not yet been checked against the airline source, so confirm it before you travel.'

  const carryOn = formatDimensions(
    airline.carry_on_length,
    airline.carry_on_width,
    airline.carry_on_height,
  )
  if (carryOn) {
    entries.push({
      question: `What size carry-on does ${airline.name} allow?`,
      answer:
        `PackRight models ${airline.name}'s carry-on allowance as ${carryOn}. A bag fits if its ` +
        `three sides are within those three measurements in any order, so it does not matter which ` +
        `side you call the length. Measure with wheels and handles included. ${unverified}`,
    })
  }

  const personal = formatDimensions(
    airline.personal_item_length,
    airline.personal_item_width,
    airline.personal_item_height,
  )
  if (personal) {
    entries.push({
      question: `What counts as a personal item on ${airline.name}?`,
      answer:
        `A personal item is the smaller bag that goes under the seat in front of you. PackRight ` +
        `models ${airline.name}'s limit as ${personal}. Every fare family we model for ` +
        `${airline.name} includes a personal item. ${unverified}`,
    })
  }

  const fares = faresForAirline(airline.id)
  const firstFees = fares
    .map((f) => f.first_checked_fee)
    .filter((f): f is number => f !== null)
  if (firstFees.length > 0) {
    const min = Math.min(...firstFees)
    const max = Math.max(...firstFees)
    entries.push({
      question: `How much is a checked bag on ${airline.name}?`,
      answer:
        `PackRight models a first checked bag on ${airline.name} at ` +
        (min === max ? money(min) : `${money(min)} to ${money(max)}`) +
        ` depending on the fare family, for a one-way US domestic trip. Airport prices, partner ` +
        `segments and international itineraries can differ, and some airlines price bags by route ` +
        `and by when you buy them. ${unverified}`,
    })
  }

  if (airline.checked_bag_weight != null) {
    entries.push({
      question: `How heavy can a checked bag be on ${airline.name}?`,
      answer:
        `PackRight models ${airline.name}'s standard checked-bag weight limit as ` +
        `${airline.checked_bag_weight} lb, with a total of length plus width plus height up to ` +
        `${airline.checked_bag_linear_dim ?? 62} inches. Going over usually means an extra charge ` +
        `that is banded by weight and differs per airline, so PackRight flags it rather than ` +
        `quoting a price. ${unverified}`,
    })
  }

  return entries
}
