import React, { useState } from 'react';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  price: number;
  capacity: number;
  booked: number;
  type: 'wedding' | 'conference' | 'dining' | 'celebration';
}

interface EventsSectionProps {
  isAdmin?: boolean;
  onEditEvent?: (event: Event) => void;
  onBookEvent?: (eventId: string) => void;
}

export const EventsSection: React.FC<EventsSectionProps> = ({ 
  isAdmin, 
  onEditEvent, 
  onBookEvent 
}) => {
  const [selectedType, setSelectedType] = useState<'all' | 'wedding' | 'conference' | 'dining' | 'celebration'>('all');

  const events: Event[] = [
    {
      id: '1',
      title: 'Wine Tasting Evening',
      date: '2024-03-15',
      time: '18:00',
      description: 'Exclusive wine tasting featuring Klein Karoo selections',
      price: 350,
      capacity: 24,
      booked: 18,
      type: 'dining'
    },
    {
      id: '2',
      title: 'Corporate Retreat Package',
      date: '2024-03-22',
      time: '09:00',
      description: 'Full-day conference facilities with catering',
      price: 1200,
      capacity: 50,
      booked: 32,
      type: 'conference'
    },
    {
      id: '3',
      title: 'Karoo Wedding Special',
      date: '2024-04-05',
      time: '16:00',
      description: 'Complete wedding package in our elegant venue',
      price: 15000,
      capacity: 120,
      booked: 0,
      type: 'wedding'
    },
    {
      id: '4',
      title: 'Birthday Celebration',
      date: '2024-03-28',
      time: '19:00',
      description: 'Private dining room for special celebrations',
      price: 800,
      capacity: 20,
      booked: 15,
      type: 'celebration'
    }
  ];

  const filteredEvents = selectedType === 'all' 
    ? events 
    : events.filter(event => event.type === selectedType);

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-slate-800 mb-4">Events & Functions</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Create unforgettable memories in our elegant event spaces
          </p>
        </div>

        <div 
          className="h-64 sm:h-80 lg:h-96 bg-cover bg-center rounded-lg mb-12"
          style={{ backgroundImage: 'url(https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969797228_e3e4e70f.webp)' }}
        />

        <div className="flex flex-wrap justify-center mb-8 border-b">
          {(['all', 'wedding', 'conference', 'dining', 'celebration'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-3 mx-1 mb-2 text-sm sm:text-lg font-medium capitalize transition-all ${
                selectedType === type
                  ? 'text-yellow-600 border-b-2 border-yellow-600'
                  : 'text-slate-600 hover:text-yellow-600'
              }`}
            >
              {type === 'all' ? 'All Events' : type}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-serif text-slate-800">{event.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  event.type === 'wedding' ? 'bg-pink-100 text-pink-800' :
                  event.type === 'conference' ? 'bg-blue-100 text-blue-800' :
                  event.type === 'dining' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {event.type}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-slate-600 mb-2">{event.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                  <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                  <span>🕐 {event.time}</span>
                  <span>👥 {event.booked}/{event.capacity} booked</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-yellow-600">R{event.price}</span>
                <div className="flex gap-2">
                  {!isAdmin && (
                    <button
                      onClick={() => onBookEvent?.(event.id)}
                      disabled={event.booked >= event.capacity}
                      className={`px-4 py-2 rounded font-medium transition-colors ${
                        event.booked >= event.capacity
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-yellow-600 text-white hover:bg-yellow-700'
                      }`}
                    >
                      {event.booked >= event.capacity ? 'Fully Booked' : 'Book Now'}
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => onEditEvent?.(event)}
                      className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors"
                    >
                      Edit Event
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};