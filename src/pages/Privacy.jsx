export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: September 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Information We Collect</h2>
          <p>
            Staff the Game collects information you provide directly when you create an account, post a job,
            or apply to a position. This may include your name, email address, phone number, location,
            and information about your sports experience or organization.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Operate and improve the Staff the Game platform</li>
            <li>Connect workers with employers in the sports industry</li>
            <li>Send transactional emails and SMS notifications related to your account and applications</li>
            <li>Process payments through our third-party payment processor (Stripe)</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Mobile Information and SMS Messaging</h2>
          <p>
            No mobile information, including phone numbers and consent to receive text messages, will be
            shared with any third parties or affiliates for marketing or promotional purposes. This
            information is used solely for the purpose of sending operational SMS notifications related
            to work shifts.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share
            information with service providers who assist us in operating the platform (such as hosting,
            payment processing, and email delivery) under confidentiality agreements. We may also disclose
            information when required by law.
          </p>
          <p className="mt-2">
            When you apply to a job, your application answers and name are shared with the employer who
            posted that position. Your email address is shared only when an employer accepts your application.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed to provide
            services. You may request deletion of your account and associated data by contacting us at
            the email address below.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Security</h2>
          <p>
            We use industry-standard measures to protect your information, including encrypted connections
            (HTTPS) and secure cloud infrastructure. No method of transmission over the internet is 100%
            secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Your Choices</h2>
          <p>
            You may update or correct your account information at any time by visiting your profile
            settings. You may opt out of SMS notifications by replying STOP to any message we send.
            You may opt out of promotional emails by clicking the unsubscribe link in any email.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant
            changes by posting the new policy on this page with an updated date.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:support@staffthegame.com" className="text-athleticBlue hover:underline">
              support@staffthegame.com
            </a>.
          </p>
        </section>

      </div>
    </div>
  )
}
