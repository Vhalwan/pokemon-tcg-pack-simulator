// src/App.jsx
import React, { useState, useEffect, useMemo } from 'react';
import PackInput from './components/PackInput';
import ResultsChart from './components/ResultsChart';
import PackList from './components/PackList';
import OpenPacksInteractive from './components/OpenPacksInteractive';
import { simulatePackBatches, openPackWithCards, openUntil } from './utils/packSimulator';

// Logos
import zsv10pt5Logo from './assets/zsv10pt5-logo.png';
import rsv10pt5Logo from './assets/rsv10pt5-logo.png';
import sv10Logo from './assets/sv10-logo.png';
import sv9Logo from './assets/sv9-logo.png';
import sv8pt5Logo from './assets/sv8pt5_logo.png';
import sv8Logo from './assets/sv8-logo.png';
import sv7Logo from './assets/sv7-logo.png';
import sv6pt5Logo from './assets/sv6pt5-logo.png';
import sv6Logo from './assets/sv6-logo.png';
import sv5Logo from './assets/sv5-logo.png';
import sv4pt5Logo from './assets/sv4pt5-logo.png';
import sv4Logo from './assets/sv4-logo.png';
import sv3pt5Logo from './assets/sv3pt5-logo.png';
import sv3Logo from './assets/sv3-logo.png';
import sv2Logo from './assets/sv2-logo.png';
import sv1Logo from './assets/sv1-logo.png';

// Slot configs
import zsv10pt5Slots from './data/blackBolt.json';
import rsv10pt5Slots from './data/whiteFlare.json';
import sv10Slots from './data/destinedRivals.json';
import sv9Slots from './data/journeytogether.json';
import sv8pt5Slots from './data/prismaticEvolutions.json';
import sv8Slots from './data/surgingSparks.json';
import sv7Slots from './data/stellarCrown.json';
import sv6pt5Slots from './data/shroudedFable.json';
import sv6Slots from './data/twilightMasquerade.json';
import sv5Slots from './data/temporalForces.json';
import sv4pt5Slots from './data/paldeanFates.json';
import sv4Slots from './data/paradoxRift.json';
import sv3pt5Slots from './data/151.json';
import sv3Slots from './data/obsidianFlames.json';
import sv2Slots from './data/paldeaEvolved.json';
import sv1Slots from './data/base.json';

const slotConfigs = {
  zsv10pt5: zsv10pt5Slots, rsv10pt5: rsv10pt5Slots, sv10: sv10Slots, sv9: sv9Slots, sv8pt5: sv8pt5Slots, sv8: sv8Slots,
  sv7: sv7Slots, sv6pt5: sv6pt5Slots, sv6: sv6Slots, sv5: sv5Slots,
  sv4pt5: sv4pt5Slots, sv4: sv4Slots, sv3pt5: sv3pt5Slots, sv3: sv3Slots,
  sv2: sv2Slots, sv1: sv1Slots
};

export default function App() {
  const [view, setView] = useState('home');
  const [selectedSet, setSelectedSet] = useState(null);
  const [cardsByRarity, setCardsByRarity] = useState(null);
  const [packsCount, setPacksCount] = useState(5);
  const [packBatches, setPackBatches] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isSlowOpen, setIsSlowOpen] = useState(false);
  const [slowPack, setSlowPack] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced feature states
  const [targetName, setTargetName] = useState('');
  const [targetRarity, setTargetRarity] = useState('');
  const [autoOpening, setAutoOpening] = useState(false);
  const [untilError, setUntilError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [packPrice, setPackPrice] = useState(4.49);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [targetValue, setTargetValue] = useState('');

  // helper to sum up card values from batches
  function computeTotalValue(batches) {
    return batches.flat()
      .filter(item => item.card && item.slotType !== 'Common' && item.slotType !== 'Uncommon')
      .reduce((sum, item) => sum + (item.card.price || 0), 0);
  }
  // Deferred fetch so simulator UI mounts first
  // Fetch cards as soon as the simulator view mounts
  useEffect(() => {
    if (view !== 'simulator' || !selectedSet) return;

    setIsLoading(true);
    console.log('Using API Key:', import.meta.env.VITE_POKEMON_API_KEY);
    (async function fetchCards() {
      try {
        const res = await fetch(`/api/v2/cards?q=set.id:${selectedSet}&pageSize=250&include=tcgplayer`, {
          headers: { 'X-Api-Key': import.meta.env.VITE_POKEMON_API_KEY },
        });
        const { data } = await res.json();
        data.forEach(c =>
          console.log(`Card: ${c.name}, rarity: ${c.rarity}`)
        );
        const grouped = data.reduce((acc, card) => {
          let rarity = card.rarity || 'Unknown';
          if (
            (card.set.id === 'zsv10pt5' && card.number === '171') ||
            (card.set.id === 'rsv10pt5' && card.number === '172')
          ) {
            rarity = 'Black White Rare';
          }
          if (
            (card.set.id === 'rsv10pt5' && card.number === '131')
          ) {
            rarity = 'Illustration Rare';
          }
          if (card.supertype === 'Pokémon' && card.subtypes?.includes('Holo')) {
            rarity = 'Reverse Holo';
          }
          acc[rarity] = acc[rarity] || [];
          acc[rarity].push(card);
          return acc;
        }, {});
        Object.values(grouped).forEach(arr => {
          arr.forEach(card => {
            const prices = card.tcgplayer?.prices || {};
            const priceEntry = Object.values(prices)[0]; // Get first price type object (e.g., holofoil)
            card.price = priceEntry?.market || 0;
          });
        });
        setCardsByRarity(grouped);
      } catch {
        setCardsByRarity({});
      } finally {
        setIsLoading(false);
      }
    })();
  }, [view, selectedSet]);

  const selectSet = id => {
    resetAll();
    setSelectedSet(id);
    setView('simulator');
  };
  const goHome = () => {
    setView('home');
    resetAll();
  };
  function resetAll() {
    setCardsByRarity(null);
    setPackBatches([]);
    setSummary(null);
    setIsSlowOpen(false);
    setCurrentCardIndex(0);
    setTargetName('');
    setTargetRarity('');
    setUntilError('');
    setShowDropdown(false);
    setShowAdvanced(false);
    setAutoOpening(false);
  }

  const openPacks = () => {
    if (!cardsByRarity) return;
    const cfg = slotConfigs[selectedSet];
    const batches = simulatePackBatches(packsCount, cardsByRarity, cfg);
    setTotalSpent(packsCount * packPrice);
    const value = computeTotalValue(batches);
    setTotalValue(value);
    setPackBatches(batches);
    tallySummary(batches);
    setIsSlowOpen(false);
  };

  const slowOpenPack = () => {
    if (!cardsByRarity) return;
    const cfg = slotConfigs[selectedSet];
    setSlowPack(openPackWithCards(cardsByRarity, cfg));
    setIsSlowOpen(true);
    setCurrentCardIndex(0);
  };

  const openUntilAction = () => {
    if ((!targetName && !targetRarity) || !cardsByRarity) return;
    setAutoOpening(true);
    const cfg = slotConfigs[selectedSet];
    const { packsOpened, batch } = openUntil({ targetName, targetRarity }, cardsByRarity, cfg);
    if (!packsOpened) {
      setUntilError(`No '${targetName || targetRarity}' found.`);
      setAutoOpening(false);
      return;
    }
    setPackBatches(batch);
    setTotalSpent(0);
    setTotalValue(0);
    tallySummary(batch);
    setIsSlowOpen(false);
    setAutoOpening(false);
    setUntilError('');
  };

  const openUntilValueAction = () => {
    // validate
    const target = parseFloat(targetValue);
    if (Number.isNaN(target) || target <= 0 || !cardsByRarity) {
      setUntilError('Please enter a valid target value > 0.');
      return;
    }

    setAutoOpening(true);
    setUntilError('');
    const cfg = slotConfigs[selectedSet];

    const batch = [];
    const MAX_PACKS = 10000; 
    let totalVal = 0;
    let packsOpened = 0;

    for (let i = 1; i <= MAX_PACKS; i++) {
      const pack = openPackWithCards(cardsByRarity, cfg);
      batch.push(pack);
      packsOpened = i;

      // compute value of all pulled relevant cards so far
      totalVal = computeTotalValue(batch);

      if (totalVal >= target) break;
    }

    if (totalVal < target) {
      setUntilError(`Target $${target.toFixed(2)} not reached within ${MAX_PACKS} packs.`);
      setAutoOpening(false);
      return;
    }

    setPackBatches(batch);
    setTotalSpent(packsOpened * packPrice);   
    setTotalValue(totalVal);                  
    tallySummary(batch);
    setIsSlowOpen(false);
    setAutoOpening(false);
  };

  function tallySummary(batches) {
    const counts = {};
    batches.flat().forEach(({ slotType }) => {
      counts[slotType] = (counts[slotType] || 0) + 1;
    });
    setSummary(counts);
  }

  // Memoize name list only when advanced panel opens
  const uniqueNames = useMemo(() => {
    if (!showAdvanced || !cardsByRarity) return [];
    const names = Object.values(cardsByRarity).flat().map(c => c.name);
    return [...new Set(names)].sort();
  }, [showAdvanced, cardsByRarity]);

  const matchingRarities = useMemo(() => {
    if (!targetName || !cardsByRarity) return [];
    const matches = Object.values(cardsByRarity).flat()
      .filter(c => c.name.toLowerCase() === targetName.toLowerCase());
    return [...new Set(matches.map(c => c.rarity || 'Unknown'))];
  }, [targetName, cardsByRarity]);

  // Render
  if (view === 'home') {
    const sets = [
      ['zsv10pt5', 'Black Bolt', zsv10pt5Logo],
      ['rsv10pt5', 'White Flare', rsv10pt5Logo],
      ['sv10', 'Destined Rivals', sv10Logo],
      ['sv9', 'Journey Together', sv9Logo],
      ['sv8pt5', 'Prismatic Evolutions', sv8pt5Logo],
      ['sv8', 'Surging Sparks', sv8Logo],
      ['sv7', 'Stellar Crown', sv7Logo],
      ['sv6pt5', 'Shrouded Fable', sv6pt5Logo],
      ['sv6', 'Twilight Masquerade', sv6Logo],
      ['sv5', 'Temporal Forces', sv5Logo],
      ['sv4pt5', 'Paldean Fates', sv4pt5Logo],
      ['sv4', 'Paradox Rift', sv4Logo],
      ['sv3pt5', '151', sv3pt5Logo],
      ['sv3', 'Obsidian Flames', sv3Logo],
      ['sv2', 'Paldea Evolved', sv2Logo],
      ['sv1', 'SV Base', sv1Logo],
    ];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-4xl font-bold mb-6">Select a Set</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sets.map(([key, name, logo]) => (
            <button
              key={key}
              onClick={() => selectSet(key)}
              className="bg-white rounded-lg p-6 shadow hover:shadow-md text-center flex flex-col items-center"
            >
              <img src={logo} alt={name} className="h-20 mb-2 object-contain" />
              <span className="text-lg font-semibold text-gray-800">{name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="p-6 max-w-3xl mx-auto bg-white">
      <button onClick={goHome} className="underline mb-4">← Back to Sets</button>
      <h1 className="text-2xl font-bold mb-4">{selectedSet} Simulator</h1>

      {isLoading && <p className="text-center mb-4">Loading cards…</p>}

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 border rounded shadow">
          <h2 className="font-semibold mb-2">Bulk Open</h2>
          <PackInput value={packsCount} onChange={setPacksCount} />
          <label className="block text-sm mt-2">
            Price per Pack
            <input
              type="number"
              step="0.01"
              value={packPrice}
              onChange={e => setPackPrice(parseFloat(e.target.value))}
              className="w-full border px-2 py-1 rounded mt-1"
            />
          </label>
          <button onClick={openPacks} disabled={isLoading || !cardsByRarity} className="mt-2 w-full py-2 rounded bg-blue-600 text-white disabled:bg-gray-400">Open Packs</button>
        </div>

        <div className="bg-gray-50 p-4 border rounded shadow">
          <h2 className="font-semibold mb-2">Slow Open</h2>
          <button onClick={slowOpenPack} disabled={isLoading || !cardsByRarity} className="w-full py-2 rounded bg-green-600 text-white disabled:bg-gray-400">Open Slowly</button>
        </div>

        <div className="bg-gray-50 p-4 border rounded shadow">
          <h2 className="font-semibold mb-2 flex justify-between items-center">Advanced
            <button onClick={() => setShowAdvanced(a => !a)} className="text-sm underline">
              {showAdvanced ? 'Hide' : 'Show'} Filters
            </button>
          </h2>
          {showAdvanced && (
            <>
              {/* --- Card name + autocomplete --- */}
              <input
                type="text"
                value={targetName}
                onChange={e => { setTargetName(e.target.value); setUntilError(''); setShowDropdown(true); }}
                className="w-full border px-2 py-1 rounded mb-2"
                placeholder="Card name"
              />
              {showDropdown && targetName && (
                <ul className="absolute bg-white border max-h-60 overflow-auto rounded shadow z-50 w-full">
                  {uniqueNames.filter(n => n.toLowerCase().startsWith(targetName.toLowerCase())).slice(0,10).map(n => (
                    <li key={n} onClick={() => { setTargetName(n); setShowDropdown(false); }} className="px-2 py-1 hover:bg-gray-100 cursor-pointer">{n}</li>
                  ))}
                </ul>
              )}

              <select value={targetRarity} onChange={e => setTargetRarity(e.target.value)} className="w-full border px-2 py-1 rounded mb-2">
                <option value="">Select Rarity</option>
                {matchingRarities.map(r => <option key={r} value={r}>{r}</option>)}
              </select>

              <button
                onClick={openUntilAction}
                disabled={autoOpening || isLoading || !cardsByRarity}
                className="w-full py-2 rounded bg-purple-600 text-white disabled:bg-gray-400 mb-4"
              >
                {autoOpening ? 'Opening...' : 'Open Until'}
              </button>


              <div className="border-t pt-4 mt-2">
                <label className="block text-sm">
                  Target value to pull (USD)
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={targetValue}
                    onChange={e => setTargetValue(e.target.value)}
                    className="w-full border px-2 py-1 rounded mt-1"
                    placeholder="e.g. 100.00"
                  />
                </label>

                <button
                  onClick={openUntilValueAction}
                  disabled={autoOpening || isLoading || !cardsByRarity}
                  className="w-full py-2 rounded bg-indigo-600 text-white disabled:bg-gray-400 mt-2"
                >
                  {autoOpening ? 'Opening...' : 'Open Until Value'}
                </button>
              </div>

              {untilError && <p className="text-red-600 mt-2 text-sm">{untilError}</p>}
            </>
          )}


        </div>
      </div>

      {!isSlowOpen && (packBatches.length > 0 || summary) && (
        <>
          <ResultsChart
            mode={packBatches.length > 0 ? 'convergence' : 'summary'}
            packBatches={packBatches}
            summary={summary}
            selectedSet={selectedSet}
          />
          {totalSpent > 0 && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p>💸 Spent: ${totalSpent.toFixed(2)}</p>
              <p>💰 Pulled: ${totalValue.toFixed(2)}</p>
              <p>
                {totalValue - totalSpent >= 0
                  ? `🎉 Gain: $${(totalValue - totalSpent).toFixed(2)}`
                  : `😢 Loss: $${(totalSpent - totalValue).toFixed(2)}`}
              </p>
            </div>
          )}
        </>
      )}


      {!isSlowOpen && packBatches.length > 0 && <PackList packs={packBatches} />}
      {isSlowOpen && slowPack.length > 0 && (
        <div onClick={() => setCurrentCardIndex(i => Math.min(i + 1, slowPack.length - 1))}>
          <OpenPacksInteractive pack={slowPack} currentCardIndex={currentCardIndex} />
        </div>
      )}
    </div>
  );
}
