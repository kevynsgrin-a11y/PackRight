import { Link } from 'react-router-dom'
import { PageHeader, Prose } from '../components/Page'

/**
 * Audit issue P1-10: an unknown route previously returned HTTP 200 with the app
 * shell, which is a soft 404 and pollutes the index. Every canonical route is
 * prerendered to its own HTML file and the host serves this page as a real 404
 * for anything else. It is also marked noindex in seo.ts.
 */
export default function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow="404"
        title="Page not found"
        lede="That page does not exist on PackRight. It may have moved, or the link may be wrong."
      />

      <Prose>
        <p>Try one of these instead:</p>
        <ul>
          <li>
            <Link to="/">Baggage fee calculator</Link>
          </li>
          <li>
            <Link to="/airlines">Airline baggage fees and carry-on limits</Link>
          </li>
          <li>
            <Link to="/carry-on-size-checker">Carry-on size checker</Link>
          </li>
          <li>
            <Link to="/personal-item-size-comparison">Personal item size limits</Link>
          </li>
          <li>
            <Link to="/methodology">How PackRight estimates baggage fees</Link>
          </li>
        </ul>
        <p>
          If you followed a link from elsewhere on this site, please{' '}
          <Link to="/contact">tell us</Link> so we can fix it.
        </p>
      </Prose>
    </>
  )
}
