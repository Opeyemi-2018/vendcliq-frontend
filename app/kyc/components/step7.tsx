'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Step7Props {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function Step7({ formData, updateFormData }: Step7Props) {
  const [shareholders, setShareholders] = useState(formData.shareholders || []);

  const addShareholder = () => {
    const newShareholder = { name: '', percentage: 0, email: '' };
    const updated = [...shareholders, newShareholder];
    setShareholders(updated);
    updateFormData({ shareholders: updated });
  };

  const removeShareholder = (index: number) => {
    const updated = shareholders.filter((_: any, i: number) => i !== index);
    setShareholders(updated);
    updateFormData({ shareholders: updated });
  };

  const updateShareholder = (index: number, field: string, value: any) => {
    const updated = shareholders.map((sh: any, i: number) =>
      i === index ? { ...sh, [field]: value } : sh
    );
    setShareholders(updated);
    updateFormData({ shareholders: updated });
  };

  const totalPercentage = shareholders.reduce(
    (sum: number, sh: any) => sum + (parseFloat(sh.percentage) || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Shareholders Information</h3>
        <button
          onClick={addShareholder}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Shareholder
        </button>
      </div>

      {shareholders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No shareholders added yet. Click "Add Shareholder" to begin.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shareholders.map((shareholder: any, index: number) => (
            <div key={index} className="p-6 border border-gray-200 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Shareholder {index + 1}</h4>
                <button
                  onClick={() => removeShareholder(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter shareholder name"
                    value={shareholder.name}
                    onChange={(e) => updateShareholder(index, 'name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="shareholder@email.com"
                    value={shareholder.email}
                    onChange={(e) => updateShareholder(index, 'email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Percentage of Shares (%)
                </label>
                <input
                  type="number"
                  placeholder="Enter percentage"
                  min="0"
                  max="100"
                  step="0.01"
                  value={shareholder.percentage}
                  onChange={(e) => updateShareholder(index, 'percentage', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {shareholders.length > 0 && (
        <div className={`p-4 rounded-lg ${totalPercentage === 100 ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <p className="text-sm font-medium">
            Total Percentage: {totalPercentage.toFixed(2)}%
            {totalPercentage !== 100 && (
              <span className="text-yellow-700 ml-2">
                (Must equal 100%)
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}