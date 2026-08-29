import { Link } from 'react-router-dom'
import { PageHeader, Prose } from '../components/Page'
import { CONTACT_EMAIL } from '../lib/seo'
import { LAST_UPDATED } from '../lib/site'

export default function Terms() {
  return (
    <>
      <PageHeader
        eyebrow="Terms"
        title="Terms of Use"
        lede="The terms that apply when you use PackRight, and the limits of what a baggage fee estimate can tell you."
      />

      <Prose>
        <h2 id="estimates">Estimates are not quotes</h2>
        <p className="text-white">
          The airline&rsquo;s booking flow and published contract of carriage control if a PackRight
          estimate differs.
        </p>
        <p>
          PackRight produces an estimate from published policy data and clearly labelled assumptions.
          Airline size, weight and fee rules change without notice, and prices can vary by route,
          fare, aircraft and when you pay. Nothing on this site is an offer, a quote, or a guarantee
          of what you will be charged. Always confirm with your airline before you travel. How the
          estimate is produced is set out in our{' '}
          <Link to="/methodology">methodology</Link>.
        </p>

        <h2 id="acceptable-use">Acceptable use</h2>
        <p>
          You may use PackRight for personal travel planning. Please do not attempt to disrupt the
          service, scrape it at a volume that degrades it for others, or present its output as an
          airline&rsquo;s own pricing. Automated access is rate limited.
        </p>

        <h2 id="no-warranty">No warranty</h2>
        <p>
          PackRight is provided &ldquo;as is&rdquo;, without warranties of any kind, express or
          implied, including fitness for a particular purpose and accuracy. We do not warrant that the
          service will be uninterrupted or that the data will be current at any given moment. Records
          awaiting review are labelled as such throughout the site.
        </p>

        <h2 id="liability">Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, PackRight and Luggageliason.com are not liable for
          any loss arising from reliance on an estimate, including baggage charges, missed flights or
          travel disruption. Your decision to check, carry or ship a bag remains yours.
        </p>

        <h2 id="third-parties">Third-party links and content</h2>
        <p>
          We link to airline and issuer policy pages so you can verify our figures. We do not control
          those sites and are not responsible for their content. Any commercial relationship would be
          disclosed under our <Link to="/affiliate-disclosure">affiliate disclosure</Link>.
        </p>

        <h2 id="changes">Changes</h2>
        <p>
          We may update these terms. The date below shows when they last changed, and continued use
          after a change means you accept the updated terms.
        </p>

        <h2 id="contact">Contact</h2>
        <p>
          Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        <p className="text-sm">Last updated {LAST_UPDATED}.</p>
      </Prose>
    </>
  )
}
