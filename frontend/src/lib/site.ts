/** Operator identity and shared values for the policy and content pages. */

/**
 * The legal entity that operates PackRight and Luggageliason.com.
 *
 * Named on the privacy, terms, affiliate-disclosure and contact pages so a
 * visitor can tell who is behind the site, and so notices have somewhere to go.
 * California's Online Privacy Protection Act expects a conspicuous policy that
 * identifies the operator; naming the entity and a real postal address is the
 * baseline for that.
 */
export const LEGAL_ENTITY = 'Oak and Main Developers LLC'

/** State whose law governs the terms and where the operator is based. */
export const OPERATING_STATE = 'California'

export const MAILING_ADDRESS = {
  street: '2108 N St.',
  locality: 'Sacramento',
  region: 'CA',
  postalCode: '95816',
  country: 'US',
} as const

/** One-line postal address for inline use in prose. */
export const MAILING_ADDRESS_LINE =
  `${MAILING_ADDRESS.street}, ${MAILING_ADDRESS.locality}, ${MAILING_ADDRESS.region} ${MAILING_ADDRESS.postalCode}`

/**
 * Displayed as "Last updated" on policy and methodology pages.
 *
 * NOTE FOR REVIEWERS: the privacy, terms and affiliate pages state what the
 * application actually does, verified against the source in this repository.
 * The operator identity, address and governing law are real. The pages have
 * still not been reviewed by counsel; complete that review before acquiring
 * traffic or enabling any commercial placement, per the audit's release gate.
 */
export const LAST_UPDATED = '29 August 2026'
