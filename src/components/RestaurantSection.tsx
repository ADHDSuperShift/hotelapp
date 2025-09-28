import React, { useState } from 'react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'starters' | 'mains' | 'desserts';
}

interface RestaurantSectionProps {
  isAdmin?: boolean;
  onEditMenu?: (item: MenuItem) => void;
}

export const RestaurantSection: React.FC<RestaurantSectionProps> = ({ isAdmin, onEditMenu }) => {
  const [activeTab, setActiveTab] = useState<'starters' | 'mains' | 'desserts'>('starters');

  const menuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Karoo Lamb Carpaccio',
      description: 'Thinly sliced Karoo lamb with rosemary oil and capers',
      price: 185,
      image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969800812_37c89958.webp',
      category: 'starters'
    },
    {
      id: '2',
      name: 'Wild Fig & Goat Cheese Salad',
      description: 'Local wild figs with creamy goat cheese and honey drizzle',
      price: 165,
      image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969802516_2322339d.webp',
      category: 'starters'
    },
    {
      id: '3',
      name: 'Springbok Medallions',
      description: 'Pan-seared springbok with indigenous herbs and red wine jus',
      price: 385,
      image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969804262_eb53f4c6.webp',
      category: 'mains'
    },
    {
      id: '4',
      name: 'Ostrich Fillet',
      description: 'Grilled ostrich with roasted vegetables and biltong butter',
      price: 345,
      image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969805969_c1b0bcfa.webp',
      category: 'mains'
    },
    {
      id: '5',
      name: 'Malva Pudding',
      description: 'Traditional South African dessert with vanilla ice cream',
      price: 125,
      image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969807707_2cf3d9fc.webp',
      category: 'desserts'
    },
    {
      id: '6',
      name: 'Rooibos Crème Brûlée',
      description: 'Infused with local rooibos tea and caramelized sugar',
      price: 145,
      image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969809414_7675e6c8.webp',
      category: 'desserts'
    }
  ];

  const filteredItems = menuItems.filter(item => item.category === activeTab);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-slate-800 mb-4">Fine Dining Restaurant</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Experience culinary excellence with locally sourced ingredients and traditional Karoo flavors
          </p>
        </div>

        <div 
          className="h-64 sm:h-80 lg:h-96 bg-cover bg-center rounded-lg mb-12"
          style={{ backgroundImage: 'url(https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969786734_f2deb808.webp)' }}
        />

        <div className="flex flex-wrap justify-center mb-8 border-b">
          {(['starters', 'mains', 'desserts'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 mx-2 mb-2 text-lg font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'text-yellow-600 border-b-2 border-yellow-600'
                  : 'text-slate-600 hover:text-yellow-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-serif text-slate-800">{item.name}</h3>
                  <span className="text-lg font-bold text-yellow-600">R{item.price}</span>
                </div>
                <p className="text-slate-600 mb-4">{item.description}</p>
                {isAdmin && (
                  <button
                    onClick={() => onEditMenu?.(item)}
                    className="w-full bg-slate-800 text-white py-2 px-4 rounded hover:bg-slate-700 transition-colors"
                  >
                    Edit Item
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