import React from 'react';

export default function CardList({ data }) {
  return (
    <ul className="list-disc pl-5">
      {Object.entries(data).map(([rarity, cnt]) => (
        <li key={rarity}>
          <strong>{rarity}:</strong> {cnt}
        </li>
      ))}
    </ul>
  );
}
