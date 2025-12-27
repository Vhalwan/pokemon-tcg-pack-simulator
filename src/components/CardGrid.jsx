export default function CardGrid({ cards }) {
  return (
    <div className="max-w-7xl mx-auto"> {/* container centered by mx-auto */}
      <div className="pl-6 pr-6"> {/* add left and right padding */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {cards.map((card, idx) => (
            <div key={idx} className="shadow rounded overflow-hidden">
              <img src={card.images.small} alt={card.name} className="w-full" />
              <div className="p-1 text-center text-xs">{card.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
