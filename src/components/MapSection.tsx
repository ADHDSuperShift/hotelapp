import React, { useState } from 'react';

interface MapSectionProps {
  isAdmin?: boolean;
  onEditLocation?: () => void;
}

export const MapSection: React.FC<MapSectionProps> = ({ isAdmin, onEditLocation }) => {
  const [activeTab, setActiveTab] = useState<'location' | 'directions' | 'attractions'>('location');

  const attractions = [
    { name: 'Tradouw Pass', distance: '15 km', description: 'Scenic mountain pass with breathtaking views' },
    { name: 'Warmwaterberg Spa', distance: '8 km', description: 'Natural hot springs and wellness center' },
    { name: 'Sanbona Wildlife Reserve', distance: '45 km', description: 'Big 5 game reserve experience' },
    { name: 'Ronnie\'s Sex Shop', distance: '12 km', description: 'Famous quirky pub and restaurant' }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-slate-800 mb-4">Location & Surroundings</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Discover our prime location in the heart of the Klein Karoo
          </p>
        </div>

        <div className="flex flex-wrap justify-center mb-8 border-b">
          {(['location', 'directions', 'attractions'] as const).map((tab) => (
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

        {activeTab === 'location' && (
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="bg-slate-100 h-96 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📍</div>
                <p className="text-lg text-slate-600">Interactive Map</p>
                <p className="text-sm text-slate-500">Google Maps integration would go here</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-serif text-slate-800 mb-4">Our Address</h3>
                <div className="space-y-2 text-slate-600">
                  <p>📍 123 Karoo Road, Barrydale, 6750</p>
                  <p>📞 +27 28 572 1000</p>
                  <p>✉️ info@barrydalekaroo.co.za</p>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">GPS Coordinates</h4>
                <p className="text-slate-600">-33.9249° S, 20.6832° E</p>
              </div>
              {isAdmin && (
                <button
                  onClick={onEditLocation}
                  className="w-full bg-slate-800 text-white py-2 px-4 rounded hover:bg-slate-700 transition-colors"
                >
                  Edit Location Details
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'directions' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-xl font-serif text-slate-800 mb-4">From Cape Town</h3>
              <ul className="space-y-2 text-slate-600">
                <li>• Take N1 towards Worcester (1.5 hours)</li>
                <li>• Turn onto R62 towards Barrydale</li>
                <li>• Continue for 45km through Tradouw Pass</li>
                <li>• Turn right on Karoo Road</li>
                <li>• Hotel on your left after 2km</li>
              </ul>
              <p className="mt-4 text-sm text-slate-500">Total journey: ~2.5 hours</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-xl font-serif text-slate-800 mb-4">From George</h3>
              <ul className="space-y-2 text-slate-600">
                <li>• Take N2 towards Mossel Bay</li>
                <li>• Turn onto R62 at Riversdale</li>
                <li>• Continue through Ladismith</li>
                <li>• Follow R62 to Barrydale</li>
                <li>• Turn left on Karoo Road</li>
              </ul>
              <p className="mt-4 text-sm text-slate-500">Total journey: ~2 hours</p>
            </div>
          </div>
        )}

        {activeTab === 'attractions' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {attractions.map((attraction, index) => (
              <div key={index} className="bg-slate-50 p-6 rounded-lg text-center hover:shadow-lg transition-shadow">
                <h4 className="text-lg font-serif text-slate-800 mb-2">{attraction.name}</h4>
                <p className="text-yellow-600 font-semibold mb-2">{attraction.distance}</p>
                <p className="text-sm text-slate-600">{attraction.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};