import { Link } from 'react-router-dom';

import { AuthLayout } from '../components/auth/AuthLayout';
import { AppShell } from '../components/layout/AppShell';
import { PageIntro } from '../components/ui/PageIntro';
import { SUPPORT_EMAIL } from '../lib/api';

export function PrivacyPage() {
  return (
    <AppShell title="Privacy" showBack backTo="/">
      <article className="prose-page">
        <PageIntro
          title="Privacy policy"
          subtitle="How PLNR handles your information. Last updated October 7, 2026."
        />
        <p>
          PLNR is the outing planner at{' '}
          <a href="https://myplnr.app/">https://myplnr.app/</a>. This policy covers the website and the
          mobile app. Questions and deletion requests go to{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
        <h2>Information we collect</h2>
        <ul>
          <li>Account details you give us: name, email address, and a password we store only as a hash.</li>
          <li>City and interests you save on your profile.</li>
          <li>
            Plan answers you type, such as city, dates, times, group size, budget, and interests, plus the
            itinerary we generate from them.
          </li>
          <li>Email addresses you use when you send a plan or invite someone to view one.</li>
          <li>A push token if you allow reminders on your phone.</li>
          <li>The IP address of a guest session, used only to apply the free monthly plan limit and to protect the service.</li>
          <li>
            On the website, the page you open, the time, your browser, device, and IP address, so we can see how
            the site is used.
          </li>
          <li>
            Payment references. On the website, Stripe processes the card. We store the card brand, last four
            digits, expiry, and a Stripe customer id. We do not store the full card number.
          </li>
          <li>On Android, a Google Play purchase token when you subscribe to Pro there.</li>
        </ul>
        <p>We do not collect precise GPS. A city or neighborhood comes from what you type or pick.</p>
        <h2>How we use it</h2>
        <ul>
          <li>To build, save, email, and share plans you ask for.</li>
          <li>To run your account, the free monthly limit, and a Pro subscription.</li>
          <li>To send reminders you opt into.</li>
          <li>To answer support requests and keep the service secure.</li>
        </ul>
        <h2>Who we share it with</h2>
        <ul>
          <li>Anthropic, to turn your plan answers into suggestions and an itinerary.</li>
          <li>Stripe, for Pro and saved cards on the website.</li>
          <li>Google Play, for Pro bought in the Android app.</li>
          <li>Our email provider, to deliver itineraries, invites, and account mail.</li>
          <li>OpenStreetMap Nominatim, when you search for a city or neighborhood.</li>
          <li>People you explicitly invite to a plan.</li>
        </ul>
        <p>We do not sell personal information.</p>
        <h2>How long we keep it</h2>
        <p>
          We keep account and plan information while the account is open. Website visit records for a
          signed-in person are deleted with the account. Guest visit records stay. Guest plan limits tied to an
          IP address are kept for the current monthly window.
        </p>
        <h2>Deleting your account</h2>
        <p>
          Signed-in people can delete an account from the account screen. Enter your password, confirm, and
          we delete the account, its saved plans, website visit records, push tokens, and saved card records. Plans that belong to
          someone else stay with them. You can also email {SUPPORT_EMAIL} and ask us to delete the account.
          We may keep a payment or security record when the law requires it.
        </p>
        <h2>Security</h2>
        <p>Traffic uses HTTPS. Passwords are hashed. Payment card numbers stay with Stripe or Google Play.</p>
        <h2>Children</h2>
        <p>
          PLNR is not for children under 13. We do not knowingly collect their personal information. If you
          believe a child gave us information, email {SUPPORT_EMAIL} and we will delete it.
        </p>
        <h2>Changes</h2>
        <p>
          If this policy changes, we update this page and the date at the top. The same text is available at{' '}
          <a href="https://myplnr.app/privacy">https://myplnr.app/privacy</a>.
        </p>
      </article>
    </AppShell>
  );
}

export function TermsPage() {
  return (
    <AppShell title="Terms" showBack backTo="/">
      <article className="prose-page">
        <PageIntro
          title="Terms of service"
          subtitle="The rules for using PLNR. Last updated October 6, 2026."
        />
        <p>
          By using the PLNR website or app you agree to these terms. The service is an outing planner for
          date nights, nights out, vacations, road trips, and weekend picks.
        </p>
        <h2>Accounts</h2>
        <p>
          An account is required to send a plan. You give accurate registration details and you keep your
          password private. You can delete the account from the account screen.
        </p>
        <h2>Free plans</h2>
        <p>
          Free planning is limited each month. When the limit is reached, the next plan requires Pro. Guest
          use can be limited by IP address so the free allowance stays fair.
        </p>
        <h2>Pro</h2>
        <p>
          Pro is a paid subscription. The price is shown before you pay. On the website, Stripe bills the
          subscription. In the Android app, Google Play bills it. You can cancel through the place you
          subscribed. Canceling stops the next renewal. Access continues until the period you already paid
          for ends.
        </p>
        <h2>Plans are a starting point</h2>
        <p>
          Suggestions and itineraries are produced with AI. They are not a guarantee of hours, prices,
          availability, safety, or reservations. You check the details before you go. PLNR does not book
          hotels or events inside the app.
        </p>
        <h2>Acceptable use</h2>
        <ul>
          <li>Use PLNR for your own outing and travel planning.</li>
          <li>Do not abuse the service, scrape it, or try to disrupt it.</li>
          <li>Do not send a plan to someone unless you have a reason to share that plan with them.</li>
        </ul>
        <h2>Your plan details</h2>
        <p>
          You let us use the answers you submit so we can generate, save, email, and share the plan you
          asked for. Our use of personal information is described in the{' '}
          <Link to="/privacy">privacy policy</Link>.
        </p>
        <h2>Availability and liability</h2>
        <p>
          PLNR is provided as available. We can suspend an account that breaks these terms. To the extent
          the law allows, PLNR is not liable for a venue change, a missed reservation, a travel decision, or
          other indirect loss that comes from relying on a generated plan.
        </p>
        <h2>Contact</h2>
        <p>
          Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. These terms are published at{' '}
          <a href="https://myplnr.app/terms">https://myplnr.app/terms</a>.
        </p>
      </article>
    </AppShell>
  );
}

export function NotFoundPage() {
  return (
    <AuthLayout
      title="Page not found"
      subtitle="This address is not a PLNR page. The link may be mistyped, or the page may have moved."
      footer={<Link to="/login">Log in</Link>}
    >
      <Link className="ui-button ui-button--primary" to="/">
        Back to home
      </Link>
    </AuthLayout>
  );
}
