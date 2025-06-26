import React, { useState } from 'react';
import axios from 'axios';

export const AcceptPaymentForm = ({ bookingId, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('cash');
  const [date, setDate] = useState('');

  const handleSubmit = async () => {
    await axios.post(`/api/booking/${bookingId}/pipeline/update`, {
      stage: 'Accept Payment',
      data: { amount, mode, date }
    });
    onSuccess();
  };

  return (
    <div className="space-x-2">
      <input
        type="number"
        placeholder="Amount"
        className="border px-2 py-1 rounded"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <select
        className="border px-2 py-1 rounded"
        value={mode}
        onChange={e => setMode(e.target.value)}
      >
        <option value="cash">Cash</option>
        <option value="cheque">Cheque</option>
        <option value="online">Online</option>
      </select>
      <input
        type="date"
        className="border px-2 py-1 rounded"
        value={date}
        onChange={e => setDate(e.target.value)}
      />
      <button onClick={handleSubmit} className="bg-green-600 text-white px-3 py-1 rounded">Submit</button>
    </div>
  );
};
