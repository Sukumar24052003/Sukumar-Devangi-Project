import React from 'react';

const Section = ({ title, children, isLast = false }) => (
  <section className={!isLast ? "pb-8" : ""}>
    <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
    <div className="text-gray-600 space-y-4">{children}</div>
  </section>
);

const PrivacyPolicy = () => {
  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy for Digiplus</h1>
        <p className="text-sm text-gray-500 mt-1">Last updated: October 26, 2023</p>
      </div>

      {/* Single Card Container */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 md:p-10">
        <Section title="Our Commitment to Privacy">
          <p>
            Welcome to Digiplus. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
          </p>
        </Section>

        <hr className="my-8 border-gray-200" />
        
        <Section title="1. Information We Collect">
          <p>
            We collect personal information that you voluntarily provide to us when you register on the application, express an interest in obtaining information about us or our products and services, when you participate in activities on the application, or otherwise when you contact us. The personal information that we collect depends on the context of your interactions with us and the application, the choices you make, and the products and features you use.
          </p>
        </Section>

        <hr className="my-8 border-gray-200" />

        <Section title="2. How We Use Your Information">
          <p>
            We use personal information collected via our application for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
          </p>
          <ul className="list-disc list-inside pl-2">
            <li>To facilitate account creation and logon process.</li>
            <li>To manage user accounts.</li>
            <li>To send administrative information to you.</li>
            <li>To protect our Services.</li>
            <li>To enforce our terms, conditions and policies.</li>
          </ul>
        </Section>

        <hr className="my-8 border-gray-200" />

        <Section title="3. Will Your Information Be Shared?">
          <p>
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
          </p>
        </Section>

        <hr className="my-8 border-gray-200" />
        
        <Section title="4. Contact Us" isLast={true}>
           <p>
            If you have questions or comments about this policy, you may email us at <strong>[Your Contact Email]</strong> or by post to:
            <span className="mt-2 block">
                [Your Company Name]<br />
                [Your Address]<br />
                [City, State, Zip Code]<br />
                [Country]
            </span>
          </p>
        </Section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;