import { Link } from 'react-router-dom'
import { PageHeader, Prose } from '../components/Page'
import { CONTACT_EMAIL, PRIVACY_EMAIL } from '../lib/seo'
import { LAST_UPDATED } from '../lib/site'

export default function Contact() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Contact PackRight"
        lede="Wrong fee? Missing airline? Privacy question? Here is where to send it."
      />

      <Prose>
        <h2 id="report-an-error">Report a wrong figure</h2>
        <p>
          This is the most useful thing you can send us. Email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and include:
        </p>
        <ul>
          <li>the airline and fare family,</li>
          <li>what PackRight showed,</li>
          <li>what the airline showed, and where you saw it,</li>
          <li>the date you checked.</li>
        </ul>
        <p>
          Corrections are recorded against the record&rsquo;s source and review date, so the fix is
          traceable. See <Link to="/methodology">how we review data</Link>.
        </p>

        <h2 id="privacy">Privacy requests</h2>
        <p>
          Email <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>. Our{' '}
          <Link to="/privacy">privacy policy</Link> explains what we do and do not collect.
        </p>

        <h2 id="everything-else">Everything else</h2>
        <p>
          Coverage requests, partnership enquiries and general feedback:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Our position on commercial links is
          set out in the <Link to="/affiliate-disclosure">affiliate disclosure</Link>.
        </p>

        <h2 id="what-we-cannot-do">What we cannot help with</h2>
        <p>
          PackRight is not an airline and has no access to your booking. We cannot change a bag fee,
          check you in, or find a lost bag. For anything on your reservation, contact your airline
          directly.
        </p>

        <p className="text-sm">Last updated {LAST_UPDATED}.</p>
      </Prose>
    </>
  )
}
