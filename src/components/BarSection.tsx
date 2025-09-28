import React, { useMemo, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';

interface DrinkItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'cocktails' | 'wines' | 'spirits';
}

interface BarSectionProps {
  isAdmin?: boolean;
  onEditDrink?: (item: DrinkItem) => void;
}

export const BarSection: React.FC<BarSectionProps> = ({ isAdmin, onEditDrink }) => {
  const [activeCategory, setActiveCategory] = useState<'cocktails' | 'wines' | 'spirits'>('cocktails');
  const { photos } = useAppContext();
  const coverUrl = useMemo(() => {
    const featured = photos.find(p => p.section === 'bar' && p.featured)
    if (featured) return featured.url
    const first = photos.filter(p => p.section === 'bar').sort((a,b) => a.order - b.order)[0]
    return first?.url
  }, [photos])

  const drinkItems: DrinkItem[] = [
    {
      id: '1',
      name: 'Karoo Sunset',
      description: 'Gin, rooibos tea, honey, and citrus',
      price: 145,
      category: 'cocktails'
    },
    {
      id: '2',
      name: 'Springbok Martini',
      description: 'Premium vodka with indigenous herbs',
      price: 165,
      category: 'cocktails'
    },
    {
      id: '3',
      name: 'Klein Karoo Cabernet',
      description: 'Full-bodied red wine from local vineyards',
      price: 85,
      category: 'wines'
    },
    {
      id: '4',
      name: 'Sauvignon Blanc Reserve',
      description: 'Crisp white wine with mineral notes',
      price: 75,
      category: 'wines'
    },
    {
      id: '5',
      name: 'Aged Brandy',
      description: 'Premium South African brandy, 12 years',
      price: 195,
      category: 'spirits'
    },
    {
      id: '6',
      name: 'Single Malt Whiskey',
      description: 'Imported Scottish single malt',
      price: 225,
      category: 'spirits'
    }
  ];

  const filteredDrinks = drinkItems.filter(item => item.category === activeCategory);

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-slate-800 mb-4">Premium Bar & Lounge</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Unwind with our carefully curated selection of premium spirits, wines, and signature cocktails
          </p>
        </div>

        <div 
          className="h-64 sm:h-80 lg:h-96 bg-cover bg-center rounded-lg mb-12"
          style={{ backgroundImage: `url(${coverUrl || 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969790377_b96b5579.webp'})` }}
        />

        <div className="flex flex-wrap justify-center mb-8 border-b">
          {(['cocktails', 'wines', 'spirits'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 mx-2 mb-2 text-lg font-medium capitalize transition-all ${
                activeCategory === category
                  ? 'text-yellow-600 border-b-2 border-yellow-600'
                  : 'text-slate-600 hover:text-yellow-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrinks.map((drink) => (
            <div key={drink.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-serif text-slate-800">{drink.name}</h3>
                <span className="text-lg font-bold text-yellow-600">R{drink.price}</span>
              </div>
              <p className="text-slate-600 mb-4">{drink.description}</p>
              {isAdmin && (
                <button
                  onClick={() => onEditDrink?.(drink)}
                  className="w-full bg-slate-800 text-white py-2 px-4 rounded hover:bg-slate-700 transition-colors"
                >
                  Edit Drink
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};