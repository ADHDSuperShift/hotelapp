import React, { useState } from 'react';

interface Wine {
  id: string;
  name: string;
  vineyard: string;
  year: number;
  price: number;
  description: string;
  type: 'red' | 'white' | 'rosé' | 'sparkling';
}

interface WineBoutiqueProps {
  isAdmin?: boolean;
  onEditWine?: (wine: Wine) => void;
}

export const WineBoutique: React.FC<WineBoutiqueProps> = ({ isAdmin, onEditWine }) => {
  const [selectedType, setSelectedType] = useState<'all' | 'red' | 'white' | 'rosé' | 'sparkling'>('all');

  const wines: Wine[] = [
    {
      id: '1',
      name: 'Reserve Cabernet Sauvignon',
      vineyard: 'Klein Karoo Estate',
      year: 2019,
      price: 450,
      description: 'Full-bodied with notes of blackcurrant and oak',
      type: 'red'
    },
    {
      id: '2',
      name: 'Chardonnay Barrel Select',
      vineyard: 'Montagu Vineyards',
      year: 2021,
      price: 380,
      description: 'Crisp and elegant with vanilla undertones',
      type: 'white'
    },
    {
      id: '3',
      name: 'Pinotage Premium',
      vineyard: 'Barrydale Cellars',
      year: 2020,
      price: 520,
      description: 'Uniquely South African with smoky complexity',
      type: 'red'
    },
    {
      id: '4',
      name: 'Rosé de Provence Style',
      vineyard: 'Robertson Valley',
      year: 2022,
      price: 320,
      description: 'Delicate pink with fresh berry flavors',
      type: 'rosé'
    },
    {
      id: '5',
      name: 'Méthode Cap Classique',
      vineyard: 'Karoo Sparkling',
      year: 2018,
      price: 650,
      description: 'Traditional method sparkling wine',
      type: 'sparkling'
    },
    {
      id: '6',
      name: 'Sauvignon Blanc Reserve',
      vineyard: 'Little Karoo',
      year: 2022,
      price: 290,
      description: 'Tropical fruit with mineral finish',
      type: 'white'
    }
  ];

  const filteredWines = selectedType === 'all' 
    ? wines 
    : wines.filter(wine => wine.type === selectedType);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-slate-800 mb-4">Wine Boutique</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Discover exceptional wines from the Klein Karoo region and beyond
          </p>
        </div>

        <div 
          className="h-64 sm:h-80 lg:h-96 bg-cover bg-center rounded-lg mb-12"
          style={{ backgroundImage: 'url(https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969794284_13db8d39.webp)' }}
        />

        <div className="flex flex-wrap justify-center mb-8 border-b">
          {(['all', 'red', 'white', 'rosé', 'sparkling'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-6 py-3 mx-2 mb-2 text-lg font-medium capitalize transition-all ${
                selectedType === type
                  ? 'text-yellow-600 border-b-2 border-yellow-600'
                  : 'text-slate-600 hover:text-yellow-600'
              }`}
            >
              {type === 'all' ? 'All Wines' : type}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWines.map((wine) => (
            <div key={wine.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-serif text-slate-800">{wine.name}</h3>
                  <p className="text-sm text-slate-500">{wine.vineyard} • {wine.year}</p>
                </div>
                <span className="text-lg font-bold text-yellow-600">R{wine.price}</span>
              </div>
              <p className="text-slate-600 mb-4">{wine.description}</p>
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  wine.type === 'red' ? 'bg-red-100 text-red-800' :
                  wine.type === 'white' ? 'bg-yellow-100 text-yellow-800' :
                  wine.type === 'rosé' ? 'bg-pink-100 text-pink-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {wine.type}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => onEditWine?.(wine)}
                    className="bg-slate-800 text-white py-1 px-3 rounded text-sm hover:bg-slate-700 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};