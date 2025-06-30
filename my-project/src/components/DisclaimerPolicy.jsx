import React from 'react';

const Section = ({ title, children, isLast = false }) => (
  <section className={!isLast ? "pb-8" : ""}>
    <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
    <div className="text-gray-600 space-y-4">{children}</div>
  </section>
);

const DisclaimerPolicy = () => {
  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Disclaimer for Digiplus</h1>
        <p className="text-sm text-gray-500 mt-1">Last updated: October 26, 2023</p>
      </div>

      {/* Single Card Container */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 md:p-10">
        <Section title="General Information Disclaimer">
          <p>
            The information provided by Digiplus ("we," "us," or "our") on this application is for general informational purposes only. All information is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the application.
          </p>
        </Section>

        <hr className="my-8 border-gray-200" />

        <Section title="External Links Disclaimer">
          <p>
            The application may contain links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, or completeness by us.
          </p>
          <p className="font-semibold text-gray-700">
            WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR THE ACCURACY OR RELIABILITY OF ANY INFORMATION OFFERED BY THIRD-PARTY WEBSITES.
          </p>
        </Section>

        <hr className="my-8 border-gray-200" />
        
        <Section title="Professional Disclaimer" isLast={true}>
          <p>
            The application cannot and does not contain financial or legal advice. The information is provided for general informational and educational purposes only and is not a substitute for professional advice.
          </p>
          <p>
            Accordingly, before taking any actions based upon such information, we encourage you to consult with the appropriate professionals. THE USE OR RELIANCE OF ANY INFORMATION CONTAINED ON THIS SITE IS SOLELY AT YOUR OWN RISK.
          </p>
        </Section>
      </div>
    </div>
  );
};

export default DisclaimerPolicy;