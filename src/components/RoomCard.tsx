import React from 'react';

interface Room {
  id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  amenities: string[];
  maxGuests: number;
}

interface RoomCardProps {
  room: Room;
  onBook: (roomId: string) => void;
  onViewDetails: (roomId: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onBook, onViewDetails }) => {
  return (
    <div className="group bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
      <div className="relative overflow-hidden">
        <img 
          src={room.image} 
          alt={room.name}
          className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-4 right-4 bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {room.maxGuests} Guests
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-2xl font-serif text-slate-800 mb-2 group-hover:text-yellow-600 transition-colors">
          {room.name}
        </h3>
        <p className="text-slate-600 mb-4 line-clamp-2">{room.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {room.amenities.slice(0, 3).map((amenity, index) => (
            <span key={index} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
              {amenity}
            </span>
          ))}
          {room.amenities.length > 3 && (
            <span className="text-xs text-slate-500">+{room.amenities.length - 3} more</span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-right">
            <div className="text-3xl font-bold text-yellow-600">R{room.price}</div>
            <div className="text-sm text-slate-500">per night</div>
          </div>
          
          <div className="space-x-2">
            <button
              onClick={() => onViewDetails(room.id)}
              className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Details
            </button>
            <button
              onClick={() => onBook(room.id)}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};