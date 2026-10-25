import { Link } from 'react-router-dom';

import { AuthLayout } from '../components/auth/AuthLayout';
import { AppShell } from '../components/layout/AppShell';
import { PageIntro } from '../components/ui/PageIntro';
import { SUPPORT_EMAIL } from '../lib/api';

const SUPPORT = SUPPORT_EMAIL;

export function PrivacyPage() {
  return (
    <AppShell title="Privacy" showBack backTo="/">
      <article className="prose-page">
        <PageIntro
          title="Privacy policy"
          subtitle="How PLNR handles your information. Last updated October 25, 2026."
        />
        <p>
          PLNR is the outing planner at <a href="https://myplnr.app/">https://myplnr.app/</a>, operated by
          Donovan Butler Jr. This policy covers the website and the app. Questions go to{' '}
          <a href={`mailto:${SUPPORT}`}>{SUPPORT}</a>.
        </p>

        <h2>Information we collect</h2>
        <p>
          We collect your name, email, and a hashed password when you create an account, plus any city and
          interests you save. Plan answers include the city, dates, times, group size, budget, and interests you
          type, and the itinerary we generate. We also store email addresses you use to send or share a plan, a
          push token if you allow reminders, and the IP address of a guest session so the free monthly limit
          stays fair. Website cards are processed by Stripe. We store the brand, last four digits, expiry, and a
          Stripe customer id, not the full card number. Android Pro stores a Google Play purchase token. Our
          servers record basic technical data with each request, such as IP address and device or browser type.
          We store a sign-in token on your device to keep you signed in.
        </p>

        <h2>How we use it</h2>
        <p>
          We use this information to build, save, email, and share the plans you ask for, to run your account
          and Pro subscription, to send reminders you opt into, and to keep the service secure. We do not
          collect precise GPS. A city comes from what you type or pick.
        </p>

        <h2>Who we share it with</h2>
        <p>
          Anthropic turns plan answers into suggestions. Don&apos;t enter sensitive details, such as health or
          financial information, into a plan. Stripe handles website payments. Google Play handles Android Pro.
          Our email provider delivers itineraries and account mail. OpenStreetMap Nominatim looks up cities you
          search. Our hosting provider stores the website, app backend, and database. People you invite can see
          the plan you share. We may share information when the law requires it, or with a buyer if PLNR is sold
          or reorganized. We do not sell personal information.
        </p>

        <h2>How long we keep it</h2>
        <p>
          We keep your account, saved city, interests, and plans until you delete them or your account. Guest IP
          addresses are kept only as long as needed to enforce the free monthly limit. Server logs are kept only
          as long as needed to keep the service secure. Emails you shared a plan with stay with that plan until
          its owner deletes it. Payment and security records are kept only as long as the law requires.
        </p>

        <h2>If someone shared a plan with you</h2>
        <p>
          We store your email address only to deliver that plan. To have it removed, email{' '}
          <a href={`mailto:${SUPPORT}`}>{SUPPORT}</a> from that address.
        </p>

        <h2>Your choices and rights</h2>
        <p>
          To get a copy of your data, correct it, or delete it, email <a href={`mailto:${SUPPORT}`}>{SUPPORT}</a>.
          We respond within 30 days and may need to confirm it&apos;s you. Depending on where you live, you may
          have more rights, and you won&apos;t be treated differently for using them. You can turn off reminders
          in your phone&apos;s settings. We only email you about your account and your plans.
        </p>

        <h2>Deleting your account</h2>
        <p>
          Delete your account from the account screen. Enter your password and confirm. We delete the account,
          its saved plans, push tokens, and saved card records. Plans that belong to someone else stay with them.
          To request deletion by email, email <a href={`mailto:${SUPPORT}`}>{SUPPORT}</a> from the address on
          your account. We complete requests within 30 days. Deleting your account does not cancel a Google Play
          subscription, so cancel it in Google Play first. We may keep a payment or security record when the law
          requires it.
        </p>

        <h2>Security</h2>
        <p>
          We hash passwords and use encrypted connections. No system is perfectly secure, so we can&apos;t
          guarantee it.
        </p>

        <h2>Children and changes</h2>
        <p>
          PLNR is not for children under 13, and we do not knowingly collect their information. If you think a
          child under 13 gave us information, email <a href={`mailto:${SUPPORT}`}>{SUPPORT}</a> and we will
          delete it. If we make a material change to this policy, we email account holders or show a notice in
          the app before it takes effect. This policy was last updated October 25, 2026. The public copy is at{' '}
          <a href="https://myplnr.app/privacy">https://myplnr.app/privacy</a>.
        </p>

        <p>
          <Link to="/terms">Terms and conditions</Link>
        </p>
      </article>
    </AppShell>
  );
}

export function TermsPage() {
  return (
    <AppShell title="Terms and conditions" showBack backTo="/">
      <article className="prose-page">
        <PageIntro
          title="Terms and conditions"
          subtitle="The rules for using PLNR. Last updated October 25, 2026."
        />
        <p>
          By using the PLNR website or app you agree to these terms. Contact support. The public copy is at{' '}
          <a href="https://myplnr.app/terms">https://myplnr.app/terms</a>.
        </p>

        <h2>Who we are</h2>
        <p>
          PLNR is operated by Donovan Butler Jr. (&quot;PLNR,&quot; &quot;we&quot;). Questions about these terms
          go to <a href={`mailto:${SUPPORT}`}>{SUPPORT}</a>.
        </p>

        <h2>Who can use PLNR</h2>
        <p>
          You must be at least 13 to use PLNR. You must be 18, or have a parent or guardian&apos;s permission, to
          buy Pro.
        </p>

        <h2>Accounts</h2>
        <p>
          An account is required to send a plan. You give accurate registration details and you keep your
          password private. You can delete the account from the account screen.
        </p>

        <h2>Free plans and Pro</h2>
        <p>
          Free planning is limited each month. Pro is a paid subscription, and the price is shown before you pay.
          On the website, Stripe bills Pro. In the Android app, Google Play bills Pro. Cancel through the place
          you subscribed. Access continues until the period you already paid for ends.
        </p>
        <p>
          Pro renews automatically every month at the price shown until you cancel. We charge your payment method
          at the start of each period. If the price changes, we email you at least 15 days before it applies, and
          you can cancel before then.
        </p>
        <p>
          Website payments are non-refundable, except where the law requires a refund or we charged you in error.
          Contact <a href={`mailto:${SUPPORT}`}>{SUPPORT}</a> within 30 days of a charge you think is wrong.
          Google Play handles refunds for Android purchases under its own policy.
        </p>
        <p>
          Deleting your account does not cancel a Google Play subscription. Cancel it in Google Play first.
        </p>

        <h2>Plans are a starting point</h2>
        <p>
          Suggestions and itineraries are produced with AI. They are not a guarantee of hours, prices,
          availability, safety, or reservations. You check the details before you go. PLNR does not book hotels
          or events inside the app.
        </p>

        <h2>Your content and our app</h2>
        <p>
          PLNR, its design, and its code belong to Donovan Butler Jr. We give you a personal, non-transferable
          right to use PLNR under these terms. You keep what you type into PLNR. You let us store, process, and
          share it as needed to build, save, and send the plans you ask for. Only share a plan with people who
          want to receive it.
        </p>

        <h2>Places and data from others</h2>
        <p>
          Plans may name venues, websites, and services we do not own or control. Your dealings with them are
          between you and them. City search uses OpenStreetMap data, ©️ OpenStreetMap contributors, available under
          the Open Database License.
        </p>

        <h2>Acceptable use and liability</h2>
        <p>
          Use PLNR for your own outing and travel planning. Do not abuse the service, scrape it, or disrupt it.
          To the extent the law allows, PLNR is not liable for a venue change, a missed reservation, or other
          indirect loss from relying on a generated plan. PLNR is provided &quot;as is&quot; and &quot;as
          available,&quot; without warranties of any kind. Our total liability for any claim about PLNR is limited
          to the greater of what you paid us in the 12 months before the claim or $50. Some places do not allow
          these limits, so they may not apply to you.
        </p>

        <h2>Suspending or ending accounts</h2>
        <p>
          We may suspend or close an account that breaks these terms or puts the service or other people at risk.
          We will tell you why unless the law or safety prevents it. You can stop using PLNR and delete your
          account at any time.
        </p>

        <h2>Governing law and disputes</h2>
        <p>
          These terms are governed by the laws of the State of Georgia, without regard to conflict-of-law rules.
          Before going to court, contact <a href={`mailto:${SUPPORT}`}>{SUPPORT}</a> and give us 30 days to try
          to resolve it. Any dispute goes to the state or federal courts in Fulton County, Georgia.
        </p>

        <h2>Changes to these terms</h2>
        <p>
          We may update these terms. If a change is material, we email account holders or show a notice in the
          app at least 14 days before it takes effect. Using PLNR after that date means you accept the new terms.
          The date at the top shows the current version.
        </p>

        <h2>General</h2>
        <p>
          If a court finds part of these terms unenforceable, the rest still applies. These terms and the privacy
          policy are the full agreement between you and PLNR about the service. If we don&apos;t enforce a term
          right away, we can still enforce it later. You may not transfer your account. We may transfer these
          terms if PLNR is sold or reorganized. You cover claims and costs that come from your misuse of PLNR or
          your breach of these terms. These terms were last updated October 25, 2026.
        </p>

        <p>
          <Link to="/privacy">Privacy policy</Link>
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
