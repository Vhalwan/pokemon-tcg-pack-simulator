import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

export default function SetSelector() {
  const [setData, setSetData] = useState(null);

  // Fetch the set data from the API
  useEffect(() => {
    async function fetchSetData() {
      const res = await fetch('https://api.pokemontcg.io/v2/sets/sv10', {
        headers: { 'X-Api-Key': '4c154e40-df09-4da2-8104-7533fe52cc13' },
      });
      const { data } = await res.json();
      setSetData(data);
    }

    fetchSetData();
  }, []);

  const history = useHistory();

  // Navigate to the Pack Simulator page for a specific set
  const handleSetClick = (setId) => {
    history.push(`/simulator/${setId}`);
  };

  if (!setData) return <p>Loading set data...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Select a Pokémon TCG Set</h1>

      <div className="flex flex-col items-center">
        <div
          className="cursor-pointer mb-6"
          onClick={() => handleSetClick(setData.id)}
        >
          <img
            src={setData.images.logo}
            alt={setData.name}
            className="w-48 h-48 object-contain"
          />
        </div>

        <p className="text-lg">Click the logo to start simulating packs!</p>
      </div>
    </div>
  );
}
