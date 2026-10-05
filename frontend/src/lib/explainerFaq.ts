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

/**
 * FAQ for the carry-on size checker page. Same rule as the rest of this file:
 * the page renders these visibly and seo.ts emits the schema. Targets the GSC
 * queries already reaching /carry-on-size-checker: 'carry on checker' #86,
 * 'carry on compliance checker' #87.5, 'luggage checker' #91, 'airport bag
 * size checker' #97.
 */
export function checkerFaqs(): FaqEntry[] {
  return [
    {
      question: 'What is a carry-on checker?',
      answer:
        'It is a tool that compares your bag\u2019s measurements — length, width, and height, wheels and handles included — against each airline\u2019s published carry-on and personal-item limits, so you know before you pack whether your bag fits the sizer. This page is one: enter your bag once and it checks every airline PackRight models.',
    },
    {
      question: 'Is a carry-on compliance checker the same thing?',
      answer:
        'Yes — \u201ccompliance\u201d is the stricter word for the same question: does the bag fit within all three dimensions at once, not just the longest one? Airlines measure in three dimensions, wheels and handles count, and the widest points of the bag are what get measured, so a bag that is compliant by one dimension can still fail the sizer.',
    },
    {
      question: 'Do wheels and handles count when measuring a carry-on?',
      answer:
        'Yes. Airline limits include wheels and handles in the measurements, which is why a bag marketed as \u201c22-inch carry-on\u201d can exceed a 22-inch limit once the wheels are in. Measure the complete bag at its widest points, including anything that protrudes, and check it against the airline before you fly.',
    },
    {
      question: 'What happens if my carry-on is over the limit?',
      answer:
        'At the gate, an oversized carry-on is usually gate-checked, which can cost more than checking it at the desk would have. That is the outcome a carry-on checker exists to prevent: measuring at home, against the actual limit for your airline, costs nothing.',
    },
  ]
}
