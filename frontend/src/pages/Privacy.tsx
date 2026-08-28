import { Link } from 'react-router-dom'
import { PageHeader, Prose } from '../components/Page'
import { API_BASE_URL } from '../lib/api'
import { CONTACT_EMAIL, PRIVACY_EMAIL } from '../lib/seo'
import { LAST_UPDATED } from '../lib/site'

const apiHost = (() => {
  try {
    return new URL(API_BASE_URL || 'https://packright-api.kevynsgrin.workers.dev').host
  } catch {
    return 'packright-api.kevynsgrin.workers.dev'
  }
})()

export default function Privacy() {
  return (
    <>
      <PageHeader
        eyebrow="Privacy"
        title="Privacy Policy"
        lede="PackRight is built to answer one question without knowing who you are. This page says what that means in practice."
      />

      <Prose>
        {/* The summary paragraph is the disclosure text specified in the audit. */}
        <p className="text-white">
          PackRight does not require an account or precise location to calculate an estimate. We send
          the airline, fare, passenger count, selected eligible benefit, and bag details you enter to
          our calculation service to return the estimate. We use Cloudflare Web Analytics to
          understand aggregate site performance. We do not sell personal information. Contact{' '}
          <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a> to ask privacy questions.
        </p>

        <h2 id="what-we-collect">What we collect</h2>
        <p>
          We do not ask for your name, email address, payment details or precise location to produce
          an estimate. There is no account and no login.
        </p>
        <p>
          The application does not write to cookies, <code>localStorage</code>,{' '}
          <code>sessionStorage</code> or IndexedDB, and does not request geolocation.
        </p>

        <h2 id="calculation-service">The calculation service</h2>
        <p>
          The calculator runs on a separate service at <code>{apiHost}</code>, operated by us on
          Cloudflare Workers. When you change a selection, the site sends that service:
        </p>
        <ul>
          <li>the airline and fare family you selected,</li>
          <li>the number of passengers,</li>
          <li>the eligible card benefit you selected, if any,</li>
          <li>the bag types, weights and any measurements you entered.</li>
        </ul>
        <p>
          These are travel-planning inputs rather than identity data, but they are still sent to a
          different origin, so we name it here. Requests are not stored as user records and the
          responses are marked <code>no-store</code>. As with any internet service, the platform
          processes connection metadata such as your IP address to route and protect the request.
        </p>

        <h2 id="analytics">Analytics</h2>
        <p>
          We use Cloudflare Web Analytics to understand aggregate traffic and performance. It is a
          privacy-first product: it does not use cookies and does not fingerprint visitors. It is
          loaded from <code>static.cloudflareinsights.com</code>.
        </p>
        <p>
          We do not run advertising pixels, retargeting scripts, session recording, or cross-site
          trackers.
        </p>

        <h2 id="hosting">Hosting and security</h2>
        <p>
          The site and the calculation service are delivered by Cloudflare over HTTPS. Cloudflare
          processes requests as our infrastructure provider, including logs it keeps to deliver and
          protect the service.
        </p>

        <h2 id="rights">Your rights</h2>
        <p>
          Because we do not build a profile of you or hold an account, there is usually nothing for
          us to look up, export or erase. If you believe we hold information about you, or you want
          to ask how this works, email{' '}
          <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a> and we will respond.
        </p>
        <p>We do not sell personal information or share it for cross-context behavioural advertising.</p>

        <h2 id="children">Children</h2>
        <p>PackRight is a general-audience travel tool and is not directed to children.</p>

        <h2 id="changes">Changes to this policy</h2>
        <p>
          If this policy changes we will update the date below. Material changes will be described on
          this page rather than applied silently.
        </p>

        <h2 id="contact">Contact</h2>
        <p>
          Privacy questions: <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>. Anything else:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, or see our{' '}
          <Link to="/contact">contact page</Link>.
        </p>

        <p className="text-sm">Last updated {LAST_UPDATED}.</p>
      </Prose>
    </>
  )
}
