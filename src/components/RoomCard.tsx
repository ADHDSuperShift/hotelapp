import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Users, Maximize2, Star } from 'lucide-react';
import type { Room } from '@/types/rooms';

interface RoomCardProps {
  room: Room;
  onBookNow: (roomId: string) => void;
  onViewDetails?: (roomId: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onBookNow, onViewDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = room.images || [room.image];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDetailsClick = () => {
    if (onViewDetails) {
      onViewDetails(room.id);
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
      <div className="relative overflow-hidden h-64">
        {/* Image Carousel */}
        <img 
          src={images[currentImageIndex]} 
          alt={`${room.name} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Carousel Controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            
            {/* Image Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Room Info Badges */}
        <div className="absolute top-4 right-4 flex gap-2">
          <div className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Users className="h-3 w-3" />
            {room.maxGuests}
          </div>
          <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Maximize2 className="h-3 w-3" />
            {room.size}
          </div>
        </div>

        {/* Premium Badge for expensive rooms */}
        {room.price > 6000 && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            Premium
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-2xl font-serif text-slate-800 mb-2 group-hover:text-yellow-600 transition-colors">
          {room.name}
        </h3>
        <p className="text-slate-600 mb-4 line-clamp-2">{room.description}</p>
        
        {/* Amenities */}
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

        {/* Features Preview */}
        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-1">Key Features:</p>
          <p className="text-sm text-slate-600 line-clamp-1">
            {room.features.slice(0, 2).join(' • ')}
            {room.features.length > 2 && '...'}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-right">
            <div className="text-3xl font-bold text-yellow-600">R{room.price.toLocaleString()}</div>
            <div className="text-sm text-slate-500">per night</div>
          </div>
          
          <div className="space-x-2">
            <button
              onClick={handleDetailsClick}
              className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Details
            </button>
            <button
              onClick={() => onBookNow(room.id)}
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