/* src/utils/packSimulator.js */

/**
 * Simulates opening multiple packs using dynamic slot configurations.
 */
export function simulatePackBatches(nPacks, cardsByRarity, slotsConfig) {
  if (!slotsConfig) throw new Error('slotsConfig is required');
  const batches = [];
  for (let i = 0; i < nPacks; i++) {
    batches.push(openPackWithCards(cardsByRarity, slotsConfig));
  }
  return batches;
}

/** Safe random pick from an array */
const safeSample = pool =>
  Array.isArray(pool) && pool.length
    ? pool[Math.floor(Math.random() * pool.length)]
    : null;

/**
 * Weighted pick among keys (relative weights).
 */
function pickWeighted(keys, defaultKey, slots) {
  const defs = keys
    .map(k => slots.find(s => s.key === k))
    .filter(Boolean);
  if (!defs.length) return defaultKey;
  const total = defs.reduce((s, d) => s + d.prob, 0);
  let roll = Math.random() * total;
  for (const { key, prob } of defs) {
    if (roll < prob) return key;
    roll -= prob;
  }
  return defaultKey;
}

/**
 * Open until a target rarity and/or name is pulled
 */
export function openUntil({ targetRarity, targetName }, cardsByRarity, slotsConfig, maxPacks = 10000) {
  const batch = [];
  for (let i = 1; i <= maxPacks; i++) {
    const pack = openPackWithCards(cardsByRarity, slotsConfig);
    batch.push(pack);
    const hit = pack.some(p => {
      const nameMatch = targetName
        ? p.card.name.toLowerCase().includes(targetName.toLowerCase())
        : false;
      const rarityMatch = targetRarity
        ? p.slotType === targetRarity
        : false;
      return targetName && targetRarity
        ? (nameMatch && rarityMatch)
        : (nameMatch || rarityMatch);
    });
    if (hit) return { packsOpened: i, batch };
  }
  return { packsOpened: null, batch };
}

/**
 * Absolute‐chance pick for special slots (each prob ∈ [0,1]).
 */
function pickChance(keys, slots) {
  const roll = Math.random();
  let cum = 0;
  for (const key of keys) {
    const def = slots.find(s => s.key === key);
    cum += def?.prob || 0;
    if (roll < cum) return key;
  }
  return null;
}

/**
 * Opens a single pack based on the slot configuration.
 */
export function openPackWithCards(cardsByRarity, slotsConfig) {
  const { slots, reverseKeys, specialKeys, rareKeys } = slotsConfig;
  const pulled = [];

  // 1. Commons
  const commonDef = slots.find(s => s.key === 'Common');
  for (let i = 0; i < (commonDef?.count || 0); i++) {
    const c = safeSample(cardsByRarity.Common);
    if (c) pulled.push({ card: c, slotType: 'Common', isReverseHolo: false });
  }

  // 2. Uncommons
  const uncommonDef = slots.find(s => s.key === 'Uncommon');
  for (let i = 0; i < (uncommonDef?.count || 0); i++) {
    const u = safeSample(cardsByRarity.Uncommon);
    if (u) pulled.push({ card: u, slotType: 'Uncommon', isReverseHolo: false });
  }

  // Build generic reversePool
  const reversePool = [
    ...(cardsByRarity.Common || []),
    ...(cardsByRarity.Uncommon || []),
    ...(cardsByRarity.Rare || [])
  ];

  if (reverseKeys) {
    // 3. First reverse slot (95:5 ASPEC vs RH vs Poké/Master)
    let firstKey = pickWeighted(reverseKeys, 'Reverse Holo', slots);
    let firstCard;
    if (firstKey === 'Reverse Holo') {
      firstCard = safeSample(reversePool);
    } else if (firstKey === 'Poke Ball' || firstKey === 'Master Ball') {
      firstCard = safeSample(reversePool);
    } else {
      firstCard = safeSample(cardsByRarity[firstKey]);
    }
    // Fallback to ensure a card always gets pushed
    if (!firstCard) {
      firstCard = safeSample(reversePool);
      firstKey = 'Reverse Holo';
    }
    pulled.push({ card: firstCard, slotType: firstKey, isReverseHolo: firstKey === 'Reverse Holo' });

    // 4. Special slot (small absolute chance only)
    const specialKey = pickChance(specialKeys, slots);
    if (specialKey) {
      let sp = safeSample(cardsByRarity[specialKey]);
      if (!sp) {
        // fallback to reverse holo
        sp = safeSample(reversePool);
        pulled.push({ card: sp, slotType: 'Reverse Holo', isReverseHolo: true });
      } else {
        pulled.push({ card: sp, slotType: specialKey, isReverseHolo: false });
      }
    } else {
      // 5. Second reverse fallback
      const masterBallDef = slots.find(s => s.key === 'Master Ball');
      const masterBallProb = masterBallDef?.prob || 0;
      let rev2 = safeSample(reversePool) || safeSample(reversePool);
      const isMB = Math.random() < masterBallProb;
      pulled.push({ card: rev2, slotType: isMB ? 'Master Ball' : 'Reverse Holo', isReverseHolo: !isMB });
    }
  } else {
    // SV9/SV10 style: two reverse or a special
    const rev1 = safeSample(reversePool);
    if (rev1) pulled.push({ card: rev1, slotType: 'Reverse Holo', isReverseHolo: true });

    const specialKey = pickChance(specialKeys, slots);
    if (specialKey) {
      const sp = safeSample(cardsByRarity[specialKey]);
      if (sp) pulled.push({ card: sp, slotType: specialKey, isReverseHolo: false });
    } else {
      const rev2 = safeSample(reversePool);
      if (rev2) pulled.push({ card: rev2, slotType: 'Reverse Holo', isReverseHolo: true });
    }
  }

  // 6. Rare slot (includes plain Rare in the weighting)
  const finalRareKey = pickWeighted([...rareKeys, 'Rare'], 'Rare', slots);
  const rarePool = cardsByRarity[finalRareKey] || cardsByRarity.Rare;
  const rareCard = safeSample(rarePool);
  if (rareCard) {
    pulled.push({ card: rareCard, slotType: finalRareKey, isReverseHolo: false });
  }

  // 7. Universal filler: ensure exactly 10 cards
  while (pulled.length < 10) {
    const fallback = safeSample(reversePool);
    pulled.push({
      card:          fallback || { name: 'Unknown Card', id: 'missing' },
      slotType:      fallback ? 'Reverse Holo' : 'Missing',
      isReverseHolo: Boolean(fallback)
    });
  }

  return pulled;
}
