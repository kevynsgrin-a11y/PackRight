import { Link } from 'react-router-dom'
import { CalculatorCta, PageHeader, Prose } from '../components/Page'
import { ProvenanceNote } from '../components/Provenance'
import { airlines } from '../lib/data'
import { formatDimensions, formatWeight } from '../lib/format'
import { airlinePagePath } from '../lib/seo'

export default function Airlines() {
  return (
    <>
      <PageHeader
        eyebrow="Airlines"
        title="Airline Baggage Fees and Carry-On Limits"
        lede={`The ${airlines.length} US airlines PackRight models, with the size and weight limits behind every estimate. Each figure links to the policy page it came from and shows when it was last checked.`}
      />

      <div className="overflow-x-auto rounded-2xl border border-white/10 mb-8">
        <table className="w-full text-sm min-w-[720px]">
          <caption className="sr-only">
            Personal item, carry-on and checked bag limits for each airline PackRight models
          </caption>
          <thead className="bg-premium-800/80 text-left">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-white">Airline</th>
              <th scope="col" className="px-4 py-3 font-semibold text-white">Personal item</th>
              <th scope="col" className="px-4 py-3 font-semibold text-white">Carry-on</th>
              <th scope="col" className="px-4 py-3 font-semibold text-white">Checked bag weight</th>
              <th scope="col" className="px-4 py-3 font-semibold text-white">Details</th>
            </tr>
          </thead>
          <tbody>
            {airlines.map((airline) => (
              <tr key={airline.id} className="border-t border-white/5 align-top">
                <th scope="row" className="px-4 py-3 font-medium text-white text-left">
                  {airline.name}
                  <span className="block text-xs font-normal text-text-muted">{airline.iata_code}</span>
                </th>
                <td className="px-4 py-3 text-text-muted">
                  {formatDimensions(
                    airline.personal_item_length,
                    airline.personal_item_width,
                    airline.personal_item_height,
                  ) ?? 'Not published'}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {formatDimensions(
                    airline.carry_on_length,
                    airline.carry_on_width,
                    airline.carry_on_height,
                  ) ?? 'Not published'}
                  {airline.carry_on_weight != null ? (
                    <span className="block text-xs">Max {formatWeight(airline.carry_on_weight)}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-text-muted">{formatWeight(airline.checked_bag_weight)}</td>
                <td className="px-4 py-3">
                  <Link
                    to={airlinePagePath(airline.slug)}
                    className="text-accent-secondary underline underline-offset-2 hover:text-white rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                  >
                    {airline.name} fees
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section aria-labelledby="sources-heading" className="mb-8">
        <h2 id="sources-heading" className="text-xl font-semibold text-white mb-3">
          Sources and review status
        </h2>
        <ul className="space-y-2 list-none">
          {airlines.map((airline) => (
            <li key={airline.id} className="rounded-xl border border-white/10 bg-premium-900/40 p-3">
              <p className="text-sm text-white mb-1">{airline.name}</p>
              <ProvenanceNote record={airline} />
            </li>
          ))}
        </ul>
      </section>

      <Prose>
        <h2 id="how-to-read">How to read this table</h2>
        <p>
          Sizes are in inches and include wheels and handles. A bag fits if its three sides are within
          the three published measurements in any order, which is how PackRight checks it. Checked
          weight is the standard limit for a US domestic economy ticket; going over usually means a
          charge that is banded by weight.
        </p>
        <p>
          Every figure here shows its own review status. A record marked{' '}
          <strong>Review pending</strong> has not been checked against its source, or was last
          checked more than 30 days ago. Read our <Link to="/methodology">methodology</Link> for what
          that means.
        </p>
      </Prose>

      <CalculatorCta />
    </>
  )
}
