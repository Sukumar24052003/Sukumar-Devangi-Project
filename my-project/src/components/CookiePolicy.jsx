import React from 'react';

const Section = ({ title, children, isLast = false }) => (
  <section className={!isLast ? "pb-8" : ""}>
    <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
    <div className="text-gray-600 space-y-4">{children}</div>
  </section>
);

const CookiePolicy = () => {
  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cookie Policy</h1>
        <p className="text-sm text-gray-500 mt-1">Last updated: October 26, 2023</p>
      </div>

      {/* Single Card Container */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 md:p-10">
        <Section title="What Are Cookies?">
          <p>
            Cookies are small text files that are stored on your computer or mobile device when you visit a website. They allow the website to recognize your device and remember if you've been to the website before. Cookies are a very common web technology; most websites use them and have done so for years.
          </p>
        </Section>

        <hr className="my-8 border-gray-200" />
        
        <Section title="How We Use Cookies">
          <p>
            We use cookies for a variety of reasons detailed below. It is recommended that you leave on all cookies if you are not sure whether you need them, as they may be used to provide a service that you use.
          </p>
           <ul className="list-disc list-inside pl-2">
            <li>
              <strong>Account & Login:</strong> If you create an account and log in, we use cookies to manage the signup process and remember your login state. This prevents you from having to log in on every single page.
            </li>
            <li>
              <strong>Site Preferences:</strong> In some cases, we may use cookies to remember your user preferences for how this site runs when you’re using it.
            </li>
          </ul>
        </Section>

        <hr className="my-8 border-gray-200" />

        <Section title="Disabling Cookies">
          <p>
            You can prevent the setting of cookies by adjusting the settings on your browser (see your browser's "Help" section for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit.
          </p>
        </Section>

        <hr className="my-8 border-gray-200" />
        
        <Section title="More Information" isLast={true}>
           <p>
            Hopefully, that has clarified things. If you are still looking for more information, you can contact us at: <strong>[Your Contact Email]</strong>.
          </p>
        </Section>
      </div>
    </div>
  );
};

export default CookiePolicy;