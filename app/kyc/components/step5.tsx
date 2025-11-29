'use client';

import { Upload } from 'lucide-react';

interface Step5Props {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function Step5({ formData, updateFormData }: Step5Props) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData({ cacDocument: file });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload CAC Document
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Upload your Certificate of Incorporation or CAC registration documents
        </p>
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center hover:border-blue-300 transition-colors cursor-pointer">
          <input
            type="file"
            id="cacDocument"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx"
          />
          <label htmlFor="cacDocument" className="cursor-pointer">
            <Upload className="mx-auto mb-4 text-gray-400" size={32} />
            <p className="text-blue-600 font-medium mb-1">Click to upload</p>
            <p className="text-sm text-gray-400">
              PDF, DOC or DOCX (max. 10MB)
            </p>
            {formData.cacDocument && (
              <p className="text-sm text-green-600 mt-2">
                ✓ {formData.cacDocument.name}
              </p>
            )}
          </label>
        </div>
      </div>

      <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
        CAC (Corporate Affairs Commission) registration is required for all Nigerian businesses.
      </div>
    </div>
  );
}
