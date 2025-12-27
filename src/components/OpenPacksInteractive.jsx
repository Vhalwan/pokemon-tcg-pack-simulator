import React from 'react';

const OpenPacksInteractive = ({ pack, currentCardIndex, onCardClick }) => {
  return (
    <div className="flex justify-center">
      <div className="flex-none">
        {/* Display the card with a larger resolution image */}
        {pack.length > 0 && currentCardIndex < pack.length && (
          <div onClick={() => onCardClick(currentCardIndex)} className="cursor-pointer">
            {/* Use large image for better resolution */}
            <img
              src={pack[currentCardIndex].card.images.large} // Use large version
              alt={pack[currentCardIndex].card.name}
              className="w-[450px] h-[630px] rounded-lg shadow-xl animate__animated animate__fadeIn"
            />
            {/* Reverse Holo label */}
            {pack[currentCardIndex].isReverseHolo && (
              <span className="text-xs text-blue-600 block text-center mt-2">Reverse</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenPacksInteractive;
