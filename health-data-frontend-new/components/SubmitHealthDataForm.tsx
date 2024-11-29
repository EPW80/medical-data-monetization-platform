'use client'

import { useState } from 'react';
import { useAccount } from 'wagmi';
import axios from 'axios';

const HEALTH_DATA_TYPES = [
  'blood_pressure',
  'heart_rate',
  'glucose_level',
  'temperature',
  'oxygen_saturation'
];

export function SubmitHealthDataForm() {
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    type: HEALTH_DATA_TYPES[0],
    value: '',
    patientId: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/submit-data', {
        healthData: {
          ...formData,
          timestamp: new Date().toISOString()
        },
        consent: true
      });

      console.log('Data submitted:', response.data);
      // Reset form data
      setFormData({
        type: HEALTH_DATA_TYPES[0],
        value: '',
        patientId: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error submitting health data:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {HEALTH_DATA_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.replace('_', ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Value</label>
        <input
          type="text"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Patient ID</label>
        <input
          type="text"
          value={formData.patientId}
          onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Submit Health Data
      </button>
    </form>
  );
}