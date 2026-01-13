import React from 'react';

const TermsOfService = () => {
  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Terms of Service</h2>
      
      <div className="space-y-4 text-gray-700">
        <p className="text-sm text-gray-500">Last updated: January 13, 2026</p>
        
        <section>
          <h3 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h3>
          <p className="text-sm leading-relaxed">
            By accessing and using this service, you accept and agree to be bound by the terms 
            and provision of this agreement. If you do not agree to abide by the above, please 
            do not use this service.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">2. Use License</h3>
          <p className="text-sm leading-relaxed">
            Permission is granted to temporarily access the materials on our platform for personal, 
            non-commercial transitory viewing only. This is the grant of a license, not a transfer 
            of title, and under this license you may not modify or copy the materials.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">3. Privacy Policy</h3>
          <p className="text-sm leading-relaxed">
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, 
            and protect your personal information. By using our service, you agree to the collection 
            and use of information in accordance with our Privacy Policy.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">4. User Responsibilities</h3>
          <p className="text-sm leading-relaxed">
            You are responsible for maintaining the confidentiality of your account and password. 
            You agree to accept responsibility for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">5. Limitation of Liability</h3>
          <p className="text-sm leading-relaxed">
            In no event shall our company or its suppliers be liable for any damages arising out 
            of the use or inability to use the materials on our platform.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">6. Modifications</h3>
          <p className="text-sm leading-relaxed">
            We may revise these terms of service at any time without notice. By using this service, 
            you are agreeing to be bound by the current version of these terms.
          </p>
        </section>

        <div className="pt-4 border-t mt-6">
          <p className="text-sm text-gray-600">
            If you have any questions about these Terms, please contact us at 
            <a href="mailto:legal@example.com" className="text-blue-600 hover:underline ml-1">
              legal@example.com
            </a>
          </p>
        </div>
      </div>

      <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition">
        I Accept the Terms
      </button>
    </div>
  );
};

export default TermsOfService;