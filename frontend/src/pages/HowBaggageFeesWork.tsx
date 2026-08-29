import { Link } from 'react-router-dom'
import { CalculatorCta, PageHeader, Prose } from '../components/Page'

export default function HowBaggageFeesWork() {
  return (
    <>
      <PageHeader
        eyebrow="Explainer"
        title="How Airline Baggage Fees Work: What Changes the Price"
        lede="Bag pricing looks arbitrary from the outside. It is not. A handful of levers decide what you pay, and most of them are set before you get to the airport."
      />

      <Prose>
        <h2 id="fare-family">1. The fare family decides your starting point</h2>
        <p>
          The single biggest factor is the ticket you bought, not the bag you packed. Airlines sell
          the same seat under several fare families, and each one includes a different baggage
          allowance. A basic fare typically includes a personal item and nothing else; a standard
          economy fare usually adds a carry-on; higher fares may include checked bags outright.
        </p>
        <p>
          This is why two people on the same flight can pay different amounts for identical bags. Check
          what your fare includes before assuming a bag is free.
        </p>

        <h2 id="count">2. Bags are priced by count, and the price climbs</h2>
        <p>
          Checked bags are priced per bag, and the second usually costs more than the first. Beyond
          the second, prices rise sharply and are often not published as a simple table. If you are
          considering a third bag, compare it against shipping before you book it.
        </p>

        <h2 id="size">3. Size is checked in three dimensions, not one</h2>
        <p>
          Carry-on and personal-item allowances are boxes: your bag has to be within all three
          measurements. Which side you call the length does not matter, but the widest points do, and
          wheels and handles count. Checked bags are usually measured as a single total of length plus
          width plus height, commonly 62 inches.
        </p>
        <p>
          Over the limit and the outcome varies. A checked bag draws an oversize charge. A carry-on is
          usually gate-checked, which can cost more than checking it at the desk would have.
        </p>

        <h2 id="weight">4. Weight is a separate cliff</h2>
        <p>
          Most US airlines set a standard checked-bag limit around 50 lb, with lower limits at some
          low-cost carriers. Going over is charged in bands rather than by the pound, so 51 lb and
          69 lb can cost the same. Moving a few heavy items into your carry-on is often the cheapest
          fix available at the counter.
        </p>

        <h2 id="benefits">5. Cards and status can remove the fee entirely</h2>
        <p>
          Airline credit cards commonly waive the first checked bag for the cardholder and a limited
          number of companions on the same reservation. The waiver usually requires the ticket to be
          bought with that card. Elite status can do the same, sometimes for more bags.
        </p>
        <p>
          These are the levers most worth checking, because they replace a fee with nothing rather than
          reducing it.
        </p>

        <h2 id="timing">6. When and where you pay changes the price</h2>
        <p>
          Paying during booking is usually cheaper than paying at the airport. Some low-cost carriers
          price bags dynamically, so the same bag on the same route costs different amounts depending
          on demand and how close to departure you buy it. A single published figure cannot represent
          that, which is why PackRight labels those records rather than quoting them with false
          precision.
        </p>

        <h2 id="what-to-do">What to do with all this</h2>
        <ul>
          <li>Check what your fare family includes before you pack.</li>
          <li>Measure your bag, including wheels, and check it against the airline.</li>
          <li>Weigh a checked bag at home; the band you land in is decided before you leave.</li>
          <li>Pay for bags during booking, not at the airport.</li>
          <li>Check whether a card you already hold waives the first bag.</li>
        </ul>

        <p>
          Put your own trip through the <Link to="/">calculator</Link> to see which of these applies,
          or compare airlines in the <Link to="/airlines">airline table</Link>.
        </p>
      </Prose>

      <CalculatorCta />
    </>
  )
}
