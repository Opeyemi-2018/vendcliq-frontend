'use client';

import { Upload } from 'lucide-react';

interface Step4Props {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function Step4({ formData, updateFormData }: Step4Props) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData({ businessProofDoc: file });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Business Proof Document
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Upload any document that proves your business existence (Utility bill, Bank statement, etc.)
        </p>
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center hover:border-blue-300 transition-colors cursor-pointer">
          <input
            type="file"
            id="businessProof"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.jpg,.png"
          />
          <label htmlFor="businessProof" className="cursor-pointer">
            <Upload className="mx-auto mb-4 text-gray-400" size={32} />
            <p className="text-blue-600 font-medium mb-1">Click to upload</p>
            <p className="text-sm text-gray-400">
              PDF, DOC, DOCX, JPG or PNG (max. 10MB)
            </p>
            {formData.businessProofDoc && (
              <p className="text-sm text-green-600 mt-2">
                ✓ {formData.businessProofDoc.name}
              </p>
            )}
          </label>
        </div>
      </div>
    </div>
  );
}