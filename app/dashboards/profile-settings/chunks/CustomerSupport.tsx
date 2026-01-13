'use client'

import  { useState } from 'react';

const CustomerSupport = () => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
   
    console.log('Support message:', message);
    alert('Your message has been sent to support!');
    setMessage('');
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-2">Customer Support</h2>
      <p className="text-gray-500 text-sm mb-6">
        Get help from our support team
      </p>

      <div className="space-y-4 mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium mb-2">Email Support</h3>
          <p className="text-sm text-gray-600 mb-2">support@example.com</p>
          <p className="text-xs text-gray-500">Response time: Within 24 hours</p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium mb-2">Phone Support</h3>
          <p className="text-sm text-gray-600 mb-2">+1 (555) 123-4567</p>
          <p className="text-xs text-gray-500">Available: Mon-Fri, 9AM-5PM EST</p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium mb-2">Live Chat</h3>
          <button className="text-sm text-blue-600 hover:underline">Start Chat</button>
          <p className="text-xs text-gray-500 mt-1">Average wait time: 2 minutes</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="block text-sm font-medium mb-2">Send us a message</label>
        <textarea
          placeholder="Describe your issue..."
      
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Send Message
        </button>
      </form>
    </div>
  );
};

export default CustomerSupport;