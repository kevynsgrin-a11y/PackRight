/**
 * Build-time reference data.
 *
 * Imports the canonical dataset at data/reference-data.json so that:
 *  - prerendered content pages have real airline data without a network call,
 *  - the calculator has an explicitly dated fallback when the API is unreachable.
 *
 * The API remains the runtime source of truth. Anything rendered from this
 * snapshot is labelled with where it came from and when it was last checked.
 */
import raw from '../../../data/reference-data.json'

export type RecordStatus = 'verified' | 'unverified' | 'assumption'

export interface Provenance {
  source_url: string | null
  source_title: string | null
  effective_date: string | null
  verified_at: string | null
  verified_by: string | null
  scope: string | null
  currency: string
  status: RecordStatus
  change_note: string | null
}

export interface Airline extends Provenance {
  id: string
  slug: string
  name: string
  iata_code: string
  personal_item_length: number | null
  personal_item_width: number | null
  personal_item_height: number | null
  carry_on_length: number | null
  carry_on_width: number | null
  carry_on_height: number | null
  carry_on_weight: number | null
  checked_bag_weight: number | null
  checked_bag_linear_dim: number | null
}

export interface FareFamily extends Provenance {
  id: string
  airline_id: string
  name: string
  includes_personal_item: number
  includes_carry_on: number
  first_checked_fee: number | null
  second_checked_fee: number | null
  third_plus_checked_fee: number | null
  carry_on_fee: number | null
}

export interface Benefit extends Provenance {
  id: string
  name: string
  airline_id: string
  benefit_type: string
  tier: string | null
  waives_first_checked: number
  waives_second_checked: number
  waives_carry_on: number
  companion_limit: number
}

export interface FeeAssumption {
  id: string
  label: string
  amount: number
  currency: string
  status: RecordStatus
  change_note: string | null
}

const bool = (v: unknown): number => (v ? 1 : 0)

export const DATASET_VERSION: string = raw.meta.version
export const REVIEW_INTERVAL_DAYS: number = raw.meta.reviewIntervalDays
export const DEFAULT_SCOPE: string = raw.meta.defaultScope

export const airlines: Airline[] = raw.airlines.map((a) => ({
  id: a.id,
  slug: a.slug,
  name: a.name,
  iata_code: a.iata_code,
  personal_item_length: a.personal_item.length,
  personal_item_width: a.personal_item.width,
  personal_item_height: a.personal_item.height,
  carry_on_length: a.carry_on.length,
  carry_on_width: a.carry_on.width,
  carry_on_height: a.carry_on.height,
  carry_on_weight: a.carry_on.weight,
  checked_bag_weight: a.checked.weight,
  checked_bag_linear_dim: a.checked.linear_dim,
  source_url: a.source_url,
  source_title: a.source_title,
  effective_date: a.effective_date,
  verified_at: a.verified_at,
  verified_by: a.verified_by,
  scope: a.scope,
  currency: a.currency,
  status: a.status as RecordStatus,
  change_note: a.change_note,
}))

export const fareFamilies: FareFamily[] = raw.fareFamilies.map((f) => ({
  id: f.id,
  airline_id: f.airline_id,
  name: f.name,
  includes_personal_item: bool(f.includes_personal_item),
  includes_carry_on: bool(f.includes_carry_on),
  first_checked_fee: f.first_checked_fee,
  second_checked_fee: f.second_checked_fee,
  third_plus_checked_fee: f.third_plus_checked_fee,
  carry_on_fee: f.carry_on_fee,
  source_url: f.source_url,
  source_title: f.source_title,
  effective_date: f.effective_date,
  verified_at: f.verified_at,
  verified_by: f.verified_by,
  scope: f.scope,
  currency: f.currency,
  status: f.status as RecordStatus,
  change_note: f.change_note,
}))

export const benefits: Benefit[] = raw.benefits.map((b) => ({
  id: b.id,
  name: b.name,
  airline_id: b.airline_id,
  benefit_type: b.benefit_type,
  tier: b.tier,
  waives_first_checked: bool(b.waives_first_checked),
  waives_second_checked: bool(b.waives_second_checked),
  waives_carry_on: bool(b.waives_carry_on),
  companion_limit: b.companion_limit,
  source_url: b.source_url,
  source_title: b.source_title,
  effective_date: b.effective_date,
  verified_at: b.verified_at,
  verified_by: b.verified_by,
  scope: b.scope,
  currency: b.currency,
  status: b.status as RecordStatus,
  change_note: b.change_note,
}))

export const assumptions: FeeAssumption[] = raw.assumptions.map((a) => ({
  id: a.id,
  label: a.label,
  amount: a.amount,
  currency: raw.meta.currency,
  status: a.status as RecordStatus,
  change_note: a.change_note,
}))

export const airlineBySlug = (slug: string): Airline | undefined =>
  airlines.find((a) => a.slug === slug)

export const airlineById = (id: string): Airline | undefined => airlines.find((a) => a.id === id)

export const faresForAirline = (airlineId: string): FareFamily[] =>
  fareFamilies.filter((f) => f.airline_id === airlineId)

export const benefitsForAirline = (airlineId: string): Benefit[] =>
  benefits.filter((b) => b.airline_id === airlineId)

/** True when a record has never been verified or is past the review interval. */
export const isReviewPending = (record: { status: RecordStatus; verified_at: string | null }): boolean => {
  if (record.status !== 'verified') return true
  if (!record.verified_at) return true
  const then = Date.parse(record.verified_at)
  if (Number.isNaN(then)) return true
  return (Date.now() - then) / 86_400_000 > REVIEW_INTERVAL_DAYS
}
