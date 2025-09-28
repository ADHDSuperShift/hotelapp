import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Users, Maximize2, Star, Wifi, Car, Coffee, Utensils, Bath } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import type { Room } from '@/types/rooms';

interface RoomDetailsModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: (roomId: string) => void;
}

const getAmenityIcon = (amenity: string) => {
  const amenityLower = amenity.toLowerCase();
  if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return Wifi;
  if (amenityLower.includes('parking') || amenityLower.includes('car')) return Car;
  if (amenityLower.includes('coffee') || amenityLower.includes('tea')) return Coffee;
  if (amenityLower.includes('restaurant') || amenityLower.includes('dining') || amenityLower.includes('mini bar')) return Utensils;
  if (amenityLower.includes('bath') || amenityLower.includes('shower') || amenityLower.includes('jacuzzi')) return Bath;
  return Star;
};

export const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({ 
  room, 
  isOpen, 
  onClose, 
  onBookNow 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = room.images || [room.image];

  if (!isOpen) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-3xl font-serif text-slate-800">{room.name}</h2>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {room.maxGuests} Guests
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Maximize2 className="h-3 w-3" />
                {room.size}
              </Badge>
              {room.price > 6000 && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                  <Star className="h-3 w-3 fill-current mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-0 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Image Gallery */}
          <div className="relative h-96 bg-slate-100">
            <img
              src={images[currentImageIndex]}
              alt={`${room.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                
                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Image Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 p-4 border-b overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex ? 'border-yellow-500' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Description</h3>
              <p className="text-slate-600 leading-relaxed">{room.description}</p>
            </div>

            {/* Key Features */}
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {room.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-slate-600">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Amenities & Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {room.amenities.map((amenity, index) => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <div key={index} className="flex items-center gap-3 text-slate-600">
                      <Icon className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                      {amenity}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pricing and Booking */}
            <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-bold text-yellow-700 mb-1">
                      R{room.price.toLocaleString()}
                    </div>
                    <div className="text-slate-600">per night (excluding taxes)</div>
                    <div className="text-sm text-slate-500 mt-1">
                      Free cancellation • Pay at property
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => {
                        onBookNow(room.id);
                        onClose();
                      }}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 text-lg font-semibold"
                    >
                      Book Now
                    </Button>
                    <div className="text-xs text-center text-slate-500">
                      Best Price Guaranteed
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Check-in</h4>
                <p className="text-slate-600 text-sm">3:00 PM - 11:00 PM</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Check-out</h4>
                <p className="text-slate-600 text-sm">Until 11:00 AM</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Cancellation</h4>
                <p className="text-slate-600 text-sm">Free until 48h before</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
