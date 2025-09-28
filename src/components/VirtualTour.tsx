import React, { useState } from 'react';

export const VirtualTour: React.FC = () => {
  const [activeView, setActiveView] = useState(0);
  
  const tourImages = [
    'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969143551_21b4a709.webp',
    'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969145361_ed87253d.webp',
    'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969147518_7539ab38.webp',
    'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969161711_2b210646.webp'
  ];

  const tourSpots = [
    { name: 'Luxury Suite', description: 'Experience our premium accommodations with panoramic Karoo views' },
    { name: 'Garden Terrace', description: 'Relax in our beautifully landscaped outdoor spaces' },
    { name: 'Executive Room', description: 'Perfect for business travelers seeking comfort and style' },
    { name: 'Spa Sanctuary', description: 'Unwind in our tranquil wellness center' }
  ];

  return (
    <section className="py-20 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif mb-4">Virtual Hotel Tour</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Explore our luxury accommodations from the comfort of your home
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={tourImages[activeView]} 
                alt={tourSpots[activeView].name}
                className="w-full h-full object-cover transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-2xl font-serif mb-2">{tourSpots[activeView].name}</h3>
                <p className="text-slate-200">{tourSpots[activeView].description}</p>
              </div>
            </div>

            <div className="flex justify-center mt-6 space-x-2">
              {tourImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveView(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    activeView === index ? 'bg-yellow-500' : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-3xl font-serif">Discover Every Detail</h3>
            <p className="text-lg text-slate-300 leading-relaxed">
              Take a virtual journey through our meticulously designed spaces. From our luxurious suites 
              to our serene spa facilities, every corner of Barrydale Karoo Boutique Hotel has been 
              crafted to provide an unforgettable experience.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {tourSpots.map((spot, index) => (
                <button
                  key={index}
                  onClick={() => setActiveView(index)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    activeView === index 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <div className="font-semibold mb-1">{spot.name}</div>
                  <div className="text-sm opacity-80">{spot.description}</div>
                </button>
              ))}
            </div>

            <button className="bg-yellow-600 text-white px-8 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-semibold">
              Schedule In-Person Visit
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};