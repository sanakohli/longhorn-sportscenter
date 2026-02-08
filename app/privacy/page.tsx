export default function PrivacyPolicy() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: February 7, 2025</p>

      <div className="space-y-6 text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">What we collect</h2>
          <p>
            When you sign in with Google, we store your name, email address, and profile picture.
            We also access your Google Calendar to check your availability and add game events on your behalf.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">How we use your data</h2>
          <p>
            Your data is used solely to provide personalized game recommendations and calendar
            integration. We do not sell, share, or distribute your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Google Calendar access</h2>
          <p>
            We request read and write access to your Google Calendar. Read access is used to detect
            scheduling conflicts. Write access is used to add game events you select. You can revoke
            this access at any time through your{" "}
            <a
              href="https://myaccount.google.com/permissions"
              className="text-[#BF5700] underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Account settings
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Data storage</h2>
          <p>
            Your data is stored securely in our database. We retain your information only as long as
            your account is active.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Contact</h2>
          <p>
            For questions about this policy, contact us at{" "}
            <a href="mailto:sanakohli@utexas.edu" className="text-[#BF5700] underline">
              sanakohli@utexas.edu
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
