import React from "react";

export default function TermsAndConditions() {
  localStorage.setItem("isCategory", "0");
  return (
    <div className=" text-gray-800 dark:text-gray-200 min-h-screen">
      <div className="max-w-[1450px] mx-auto px-4 pb-16 mt-16 sm:mt-28 lg:mt-28">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
          Terms & Conditions
        </h1>
        {/* INTRODUCTION  */}
        <section className="mb-8">
          <p>
            Welcome to <strong>Opinion Kings</strong>. These Terms & Conditions
            {`("Terms")`} govern your access to and use of the Opinion Kings
            website, mobile application, and related services{" "}
            {`(collectively, the
            “Platform”)`}
            . By accessing or using the Platform, you agree to be legally bound
            by these Terms.
          </p>
        </section>

        {/* ELIGIBILITY */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">1. Eligibility</h2>
          <p>
            You must be at least <strong>18 years old</strong> to use Opinion
            Kings. By using the Platform, you represent and warrant that you are
            legally eligible to participate under applicable laws in your
            jurisdiction.
          </p>
        </section>

        {/* ACCOUNT REGISTRATION */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            2. Account Registration
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must provide accurate and complete information.</li>
            <li>
              You are responsible for maintaining account confidentiality.
            </li>
            <li>
              You are fully responsible for all activities under your account.
            </li>
            <li>
              We reserve the right to suspend or terminate accounts at our
              discretion.
            </li>
          </ul>
        </section>

        {/* PLATFORM NATURE */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            3. Nature of the Platform
          </h2>
          <p>
            Opinion Kings is an opinion-based prediction platform that allows
            users to express views on real-world events. The Platform does not
            provide financial, investment, legal, or gambling advice.
          </p>
        </section>

        {/* TRADING & OPINIONS */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            4. Opinion Trading & Settlements
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Outcomes are resolved based on predefined and transparent
              criteria.
            </li>
            <li>All settlements are final once processed.</li>
            <li>
              Users acknowledge risks associated with opinion-based markets.
            </li>
            <li>Market rules may vary per event and are binding.</li>
          </ul>
        </section>

        {/* PAYMENTS */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            5. Payments, Fees & Withdrawals
          </h2>
          <p>
            Users may be required to deposit funds to participate. Applicable
            fees, commissions, or charges will be disclosed prior to
            transactions. Withdrawals are subject to verification and platform
            policies.
          </p>
        </section>

        {/* PROHIBITED ACTIVITIES */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            6. Prohibited Activities
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Market manipulation or abuse</li>
            <li>Use of bots or automated trading systems</li>
            <li>Providing false or misleading information</li>
            <li>Attempting to exploit platform vulnerabilities</li>
            <li>Money laundering or unlawful activities</li>
          </ul>
        </section>

        {/* SUSPENSION */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            7. Account Suspension & Termination
          </h2>
          <p>
            Opinion Kings reserves the right to suspend or terminate accounts
            without prior notice if these Terms are violated or if suspicious
            activity is detected.
          </p>
        </section>

        {/* INTELLECTUAL PROPERTY */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            8. Intellectual Property
          </h2>
          <p>
            All content, trademarks, logos, software, and materials on the
            Platform are owned by Opinion Kings and protected by applicable
            intellectual property laws.
          </p>
        </section>

        {/* DISCLAIMER */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            9. Disclaimer of Warranties
          </h2>
          <p>
            The Platform is provided on an “as is” and “as available” basis.
            Opinion Kings makes no warranties regarding accuracy, reliability,
            or availability of the Platform.
          </p>
        </section>

        {/* LIMITATION */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            10. Limitation of Liability
          </h2>
          <p>
            Opinion Kings shall not be liable for any indirect, incidental,
            consequential, or punitive damages arising from use of the Platform.
          </p>
        </section>

        {/* GOVERNING LAW */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">11. Governing Law</h2>
          <p>
            These Terms shall be governed and interpreted in accordance with the
            laws of India, without regard to conflict of law principles.
          </p>
        </section>

        {/* CHANGES */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">12. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Continued
            use of the Platform constitutes acceptance of updated Terms.
          </p>
        </section>

        {/* CONTACT */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-3">
            13. Contact Information
          </h2>
          <p>For questions regarding these Terms, please contact us:</p>
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
