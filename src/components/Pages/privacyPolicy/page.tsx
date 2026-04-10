import React from "react";

export default function PrivacyPolicy() {
  localStorage.setItem("isCategory", "0");
  return (
    <div className=" text-gray-800 dark:text-gray-200 min-h-screen">
      <div className="max-w-[1450px] mx-auto px-4 pb-16 mt-16 sm:mt-28 lg:mt-28">
        <h1 className="text-3xl md:text-4xl font-semibold globalFonts  mb-6 text-center">
          Privacy Policy
        </h1>

        {/* <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-10">
          Last updated: {new Date().toLocaleDateString()}
        </p> */}

        {/* INTRO */}
        <section className="mb-8">
          <p className="font-normal globalFonts">
            Welcome to <strong>Opinion Kings</strong>. Your privacy is important
            to us. This Privacy Policy explains how we collect, use, disclose,
            and protect your information when you access or use our website,
            mobile application, and related services (collectively, the
            “Platform”).
          </p>
        </section>

        {/* INFORMATION COLLECTED */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            1. Information We Collect
          </h2>

          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Personal Information:</strong> Name, email address, phone
              number, username, KYC details (if applicable), and wallet
              identifiers.
            </li>
            <li>
              <strong>Account & Transaction Data:</strong> Trades, predictions,
              positions, profits/losses, deposits, withdrawals, and activity
              history.
            </li>
            <li>
              <strong>Technical Information:</strong> IP address, browser type,
              device information, operating system, and usage logs.
            </li>
            <li>
              <strong>Cookies & Tracking:</strong> Cookies, pixels, and similar
              technologies to improve platform performance and user experience.
            </li>
          </ul>
        </section>

        {/* USE OF INFORMATION */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            2. How We Use Your Information
          </h2>

          <ul className="list-disc pl-6 space-y-2">
            <li>To create and manage your account</li>
            <li>To facilitate opinion trading and settlements</li>
            <li>To process payments and withdrawals</li>
            <li>To comply with legal and regulatory requirements</li>
            <li>To detect fraud, abuse, or suspicious activity</li>
            <li>To improve platform features and user experience</li>
            <li>To communicate updates, alerts, and support responses</li>
          </ul>
        </section>

        {/* DATA SHARING */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            3. Sharing of Information
          </h2>

          <p className="mb-3">
            We do <strong>not sell</strong> your personal data. We may share
            information only in the following cases:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li>
              With trusted service providers (payment processors, KYC vendors)
            </li>
            <li>To comply with laws, regulations, or legal processes</li>
            <li>
              To protect the rights, safety, and integrity of Opinion Kings
            </li>
            <li>During a merger, acquisition, or asset transfer</li>
          </ul>
        </section>

        {/* DATA SECURITY */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
          <p>
            We implement industry-standard security measures including
            encryption, secure servers, access controls, and monitoring systems
            to protect your data. However, no system is 100% secure, and we
            cannot guarantee absolute security.
          </p>
        </section>

        {/* USER RIGHTS */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>

          <ul className="list-disc pl-6 space-y-2">
            <li>Access and review your personal information</li>
            <li>Request correction or deletion of your data</li>
            <li>Withdraw consent where applicable</li>
            <li>Request account deactivation</li>
          </ul>
        </section>

        {/* COOKIES */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">6. Cookies Policy</h2>
          <p>
            Opinion Kings uses cookies to enhance user experience, analyze
            traffic, and personalize content. You can control cookie preferences
            through your browser settings.
          </p>
        </section>

        {/* THIRD PARTY LINKS */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">7. Third-Party Links</h2>
          <p>
            Our platform may contain links to third-party websites. We are not
            responsible for the privacy practices or content of those sites.
          </p>
        </section>

        {/* CHILDREN */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">8. Children’s Privacy</h2>
          <p>
            Opinion Kings is not intended for users under the age of 18. We do
            not knowingly collect personal data from minors.
          </p>
        </section>

        {/* POLICY UPDATES */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            9. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page with an updated revision date.
          </p>
        </section>

        {/* CONTACT */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
          <p>
            If you have any questions or concerns regarding this Privacy Policy,
            please contact us at:
          </p>

          <p className="mt-3">
            📧 <strong>Email:</strong> support@opinionkings.com <br />
            🌐 <strong>Website:</strong> www.opinionkings.com
          </p>
        </section>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Opinion Kings. All rights reserved.
        </div>
      </div>
    </div>
  );
}
