import { Link } from 'react-router-dom'
import { PageHeader, Prose } from '../components/Page'
import { CONTACT_EMAIL } from '../lib/seo'
import { LAST_UPDATED, LEGAL_ENTITY } from '../lib/site'

export default function AffiliateDisclosure() {
  return (
    <>
      <PageHeader
        eyebrow="Disclosure"
        title="Affiliate Disclosure"
        lede="Where PackRight stands on commercial links, and what is running on this site today."
      />

      <Prose>
        <h2 id="today">What is running today</h2>
        <p className="text-white">
          PackRight, operated by {LEGAL_ENTITY}, currently carries no affiliate links, no sponsored
          placements and no advertising.
        </p>
        <p>
          An earlier build of this site showed product and shipping recommendation cards whose links
          went nowhere. They had no destination, no disclosure and no partner agreement behind them,
          so they have been removed. The suggestions that appear beside an estimate now link only to
          PackRight&rsquo;s own pages.
        </p>

        <h2 id="standard">The standard we hold commercial links to</h2>
        <p>If that changes, this is the disclosure that will appear next to any commercial recommendation:</p>
        <blockquote className="border-l-2 border-accent-primary/50 pl-4 text-white my-4">
          Some links may be affiliate links. If you choose to buy through them, PackRight may earn a
          commission at no extra cost to you. Recommendations are selected for relevance to the trip
          inputs shown, not because of commission alone.
        </blockquote>

        <p>Alongside that, every commercial link will:</p>
        <ul>
          <li>resolve to a real, approved destination, never a placeholder,</li>
          <li>
            carry <code>rel=&quot;sponsored noopener noreferrer&quot;</code> and say when it opens in
            a new tab,
          </li>
          <li>show the disclosure next to the link itself, not only on this page,</li>
          <li>
            be chosen for relevance to the trip you entered. For a product recommended on size, that
            means its dimensions are checked against the airline you selected.
          </li>
        </ul>

        <h2 id="separation">Editorial separation</h2>
        <p>
          Fee estimates, airline data and packing guidance are produced from the sources listed in our{' '}
          <Link to="/methodology">methodology</Link>. No commercial relationship will change a fee
          figure, an airline&rsquo;s ranking in a comparison table, or the advice on a content page.
        </p>
        <p>
          We will not claim a saving without the inputs to support it. A statement like &ldquo;ship
          your bag for less&rdquo; requires a real shipping quote for your route and dates, not a
          comparison against an estimated bag fee.
        </p>

        <h2 id="cards">Credit card content</h2>
        <p>
          Card benefits are modelled because they change what you pay for a bag. Card terms are set by
          the issuer and change without notice. PackRight does not run a card application widget, and
          any future card content would go through compliance review before launch.
        </p>

        <h2 id="contact">Questions</h2>
        <p>
          Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        <p className="text-sm">Last updated {LAST_UPDATED}.</p>
      </Prose>
    </>
  )
}
