// src/components/ResultsChart.jsx
import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

export default function ResultsChart({ summary, selectedSet }) {
  const canvasRef = useRef();

  useEffect(() => {
    if (!summary) return;

    const ctx = canvasRef.current.getContext('2d');
    if (canvasRef.current.chart) canvasRef.current.chart.destroy();

    const orderedLabels =
      selectedSet === 'zsv10pt5'
        ? [
            'Common',
            'Uncommon',
            'Reverse Holo',
            'Rare',
            'Poke Ball',
            'Double Rare',
            'Master Ball',
            'Ultra Rare',
            'Illustration Rare',
            'Special Illustration Rare',
            'Black White Rare',
          ]
        : selectedSet === 'rsv10pt5'
        ? [
            'Common',
            'Uncommon',
            'Reverse Holo',
            'Rare',
            'Poke Ball',
            'Double Rare',
            'Master Ball',
            'Ultra Rare',
            'Illustration Rare',
            'Special Illustration Rare',
            'Black White Rare',
          ]
        : selectedSet === 'sv8pt5'
        ? [
            'Common',
            'Uncommon',
            'Reverse Holo',
            'Rare',
            'Poke Ball',
            'Double Rare',
            'Master Ball',
            'ACE SPEC Rare',
            'Ultra Rare',
            'Special Illustration Rare',
            'Hyper Rare',
          ]
        : selectedSet === 'sv8'
        ? [
            'Common',
            'Uncommon',
            'Reverse Holo',
            'Rare',
            'Double Rare',
            'Illustration Rare',
            'ACE SPEC Rare',
            'Ultra Rare',
            'Special Illustration Rare',
            'Hyper Rare',
          ]
        : selectedSet === 'sv7'
        ? [
            'Common',
            'Uncommon',
            'Reverse Holo',
            'Rare',
            'Double Rare',
            'Illustration Rare',
            'ACE SPEC Rare',
            'Ultra Rare',
            'Special Illustration Rare',
            'Hyper Rare',
          ]
        : selectedSet === 'sv6pt5'
        ? [
            'Common',
            'Uncommon',
            'Reverse Holo',
            'Rare',
            'Double Rare',
            'Illustration Rare',
            'ACE SPEC Rare',
            'Ultra Rare',
            'Special Illustration Rare',
            'Hyper Rare',
          ]
        : selectedSet === 'sv6'
        ? [
            'Common',
            'Uncommon',
            'Reverse Holo',
            'Rare',
            'Double Rare',
            'Illustration Rare',
            'ACE SPEC Rare',
            'Ultra Rare',
            'Special Illustration Rare',
            'Hyper Rare',
          ]
        : selectedSet === 'sv5'
        ? [
            'Common',
            'Uncommon',
            'Reverse Holo',
            'Rare',
            'Double Rare',
            'Illustration Rare',
            'ACE SPEC Rare',
            'Ultra Rare',
            'Special Illustration Rare',
            'Hyper Rare',
          ]
        : selectedSet === 'sv4pt5'
        ? [
            'Common',
            'Uncommon',
            'Reverse Holo',
            'Rare',
            'Shiny Rare',
            'Double Rare',
            'Shiny Ultra Rare',
            'Illustration Rare',
            'Ultra Rare',
            'Special Illustration Rare',
            'Hyper Rare',
          ]
        : [
            'Common',
            'Uncommon',
            'Reverse Holo',
            'Rare',
            'Double Rare',
            'Illustration Rare',
            'Ultra Rare',
            'Special Illustration Rare',
            'Hyper Rare',
          ];

    // Always include all labels (zero counts too)
    const dataValues = orderedLabels.map(label => summary[label] || 0);

    canvasRef.current.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: orderedLabels,
        datasets: [
          {
            label: '# Pulled',
            data: dataValues,
            backgroundColor: '#646cff',
            borderRadius: 6,
            barPercentage: 0.8,
            categoryPercentage: 0.9,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { autoSkip: false, maxRotation: 0 },
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
          },
        },
      },
    });
  }, [summary, selectedSet]);

  return <canvas ref={canvasRef} className="mb-4 w-full h-80" />;
}
