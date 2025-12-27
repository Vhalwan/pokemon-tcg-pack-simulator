// src/components/PackList.jsx
import React from 'react';

export default function PackList({ packs }) {
  return (
    <div className="space-y-6">
      {packs.map((pack, idx) => (
        <div key={idx} className="border p-2 rounded">
          <h2 className="font-semibold mb-2">Pack {idx + 1}</h2>
          <div className="grid grid-cols-5 gap-2">
            {pack.map(({ card, slotType, isReverseHolo }, i) => (
              <div key={i} className="flex flex-col items-center">
                <img
                  src={card.images.small}
                  alt={card.name}
                  className="rounded mb-1"
                />
                {/* Always show the slotType, e.g. 'Poke Ball', 'Master Ball', etc. */}
                <span
                  className={`text-xs font-semibold ${
                    slotType === 'Common' || slotType === 'Uncommon'
                      ? 'text-gray-700'
                      : slotType === 'Rare' ||
                        slotType === 'Double Rare' ||
                        slotType === 'Ultra Rare'
                      ? 'text-yellow-600'
                      : 'text-blue-600'
                  }`}
                >
                  {slotType}
                </span>
                  {(() => {
                    if (
                      typeof slotType !== 'string' ||
                      ['Common', 'Uncommon', 'Reverse Holo', 'Poke Ball', 'Master Ball'].includes(slotType)
                    ) return null;

                    return typeof card.price === 'number' ? (
                      <span className="text-xs text-green-600 mt-1">
                        ${card.price.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 mt-1">No price</span>
                    );
                  })()}

              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
