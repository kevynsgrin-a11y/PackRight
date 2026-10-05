/**
 * Question and answer text for the baggage-fees explainer page.
 *
 * Same rule as src/lib/airlineFaq.ts: the page renders these visibly and
 * seo.ts emits the matching FAQPage schema, so the structured data can never
 * describe a question a reader cannot see. Every answer restates prose that
 * already exists on the page — no new claims.
 */

export interface FaqEntry {
  question: string
  answer: string
}

export function explainerFaqs(): FaqEntry[] {
  return [
    {
      question: 'Why do airlines charge for checked bags?',
      answer:
        'Because the fare family you bought probably does not include one. Airlines sell the same seat under several fare families with different baggage allowances — a basic fare typically includes a personal item and nothing else — so the bag is priced separately from the seat. Check what your fare includes before assuming a bag is free, because that single line item decides your starting point.',
    },
    {
      question: 'Does it cost money to check a bag?',
      answer:
        'It depends on three things the explainer on this page walks through: your fare family (some include checked bags outright), count (the second bag usually costs more than the first), and when you pay (during booking is usually cheaper than at the airport). An airline credit card or elite status can remove the first checked bag fee entirely — the waiver usually requires buying the ticket with that card.',
    },
    {
      question: 'What does "pay to check bags" mean at booking?',
      answer:
        'It is the airline telling you the fare you are looking at does not include a checked bag, and that you will pay for each bag separately — per bag, with the price climbing for the second and beyond. It is usually cheaper to pay for bags during booking than at the airport, and some low-cost carriers price bags dynamically, so the same bag costs different amounts depending on when you buy.',
    },
  ]
}
