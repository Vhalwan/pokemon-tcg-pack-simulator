import React from 'react';
export default function PackInput({ value, onChange }) {
  return (
    <input
      type="number"
      min={1}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="p-2 border rounded w-24"
      placeholder="# Packs"
    />
  );
}