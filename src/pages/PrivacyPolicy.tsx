export function PrivacyPolicy() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-500 text-sm mb-10">Last updated: May 12, 2026</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <p>
            Ruckus is a personal reading tracker and book-club app. This policy
            explains what we collect, why, who we share it with, and how to
            request changes or deletion. We've tried to keep it short and in
            plain language — if anything is unclear, email us (see below).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">What we collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account info</strong> — your email address, which is used
              to sign you in via a one-time code.
            </li>
            <li>
              <strong>Reading data</strong> — books you add to your library,
              reading status (to-read / in-progress / finished), pages read,
              dates, and any notes you write.
            </li>
            <li>
              <strong>Club data</strong> — clubs you create or join, members you
              invite, suggestions and comments you post in a club.
            </li>
            <li>
              <strong>Profile</strong> — an optional display name and avatar you
              set in Settings.
            </li>
          </ul>
          <p className="mt-3">
            We don't collect location, contacts, device identifiers for
            advertising, or any analytics about how you use the app.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Why we collect it</h2>
          <p>
            Everything above is what makes the app work — signing you in,
            showing your library, sharing reading progress with people in your
            book clubs. We don't use your data for advertising, profiling, or
            anything outside the features you can see in the app.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Who we share it with</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Supabase</strong> — our authentication and database
              provider. They store your account, books, notes, and club data on
              servers they operate. See{' '}
              <a
                href="https://supabase.com/privacy"
                className="text-indigo-600 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                supabase.com/privacy
              </a>
              .
            </li>
            <li>
              <strong>Google Books API</strong> — when you search for a book,
              your search terms are sent to Google's public Books API to fetch
              titles, authors, and cover images. No account info is sent.
            </li>
            <li>
              <strong>Cloudflare Pages</strong> — hosts the web version of the
              app. Standard request logs (IP, user agent) are handled by
              Cloudflare per their privacy policy.
            </li>
            <li>
              <strong>Other club members</strong> — anything you choose to share
              inside a club (suggestions, public notes, reading progress) is
              visible to other members of that club. Notes you mark private stay
              private.
            </li>
          </ul>
          <p className="mt-3">
            We don't sell your data, share it with advertisers, or transfer it
            to anyone else.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Your rights</h2>
          <p>You can:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>See what we have about you — open the app; it's all there.</li>
            <li>Edit or delete any book, note, or club you've created.</li>
            <li>
              Request a copy of your full account data, or delete your account
              entirely, by emailing the address below. We'll respond within 30
              days.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Children</h2>
          <p>
            Ruckus isn't directed at children under 13. We don't knowingly
            collect data from anyone under 13. If you believe a child has
            created an account, email us and we'll delete it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Changes</h2>
          <p>
            If we change how we handle data we'll update this page and the date
            at the top. For meaningful changes we'll also notify you in the app
            before they take effect.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact</h2>
          <p>
            Email{' '}
            <a
              href="mailto:goodertechs@gmail.com"
              className="text-indigo-600 hover:underline"
            >
              goodertechs@gmail.com
            </a>{' '}
            for anything in this policy, data requests, or account deletion.
          </p>
        </section>
      </div>
    </div>
  );
}
