'use client'

import  { useState } from 'react';
import { FileText } from 'lucide-react';

const BusinessVerification = () => {
  const [verificationData, setVerificationData] = useState({
    businessName: '',
    registrationNumber: '',
    taxId: '',
    address: '',
    documents: null
  });

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    console.log('Verification submitted:', verificationData);
    alert('Business verification submitted!');
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-2">Business Verification</h2>
      <p className="text-gray-500 text-sm mb-6">
        Verify your business to unlock additional features
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Status:</strong> Pending Verification
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Business Name</label>
          <input
            type="text"
            placeholder="Enter business name"
            value={verificationData.businessName}
            onChange={(e) => setVerificationData({...verificationData, businessName: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Registration Number</label>
          <input
            type="text"
            placeholder="Enter registration number"
            value={verificationData.registrationNumber}
            onChange={(e) => setVerificationData({...verificationData, registrationNumber: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tax ID</label>
          <input
            type="text"
            placeholder="Enter tax identification number"
            value={verificationData.taxId}
            onChange={(e) => setVerificationData({...verificationData, taxId: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Business Address</label>
          <textarea
            placeholder="Enter business address"
            rows={3}
            value={verificationData.address}
            onChange={(e) => setVerificationData({...verificationData, address: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Upload Documents</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input type="file" className="hidden" id="file-upload" multiple />
            <label htmlFor="file-upload" className="cursor-pointer">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Submit for Verification
        </button>
      </form>
    </div>
  );
};

export default BusinessVerification;