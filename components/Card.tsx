import React, { useState, useEffect } from 'react';
import { CardData } from '../types';

interface CardProps {
  data: CardData;
  isActive: boolean;
  onImageLoad: () => void;
}

export const Card: React.FC<CardProps> = ({ data, isActive, onImageLoad }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset loading state whenever the card data changes (new round/next card)
  useEffect(() => {
    setImageLoaded(false);
  }, [data.id]);

  if (!isActive) return null;

  // Generate a dynamic image URL based on the name
  const encodedName = encodeURIComponent(`${data.name} ${data.category} portrait icon bright colorful style`);
  // Adding a cache buster/seed helps ensure we get a fresh attempt or consistent cache behavior
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedName}?width=400&height=400&nologo=true&seed=${data.id}`;

  const handleImageLoad = () => {
    setImageLoaded(true);
    onImageLoad();
  };

  return (
    <div className="w-full h-full flex flex-col relative mb-20 animate-fade-in">
      
      {/* Card Container */}
      <div className="flex-1 bg-white rounded-3xl shadow-2xl border-[6px] border-brand-blue overflow-hidden flex flex-col relative">
        
        {/* Header Category */}
        <div className="bg-brand-blue p-2 text-center shrink-0 z-10">
          <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">
            {data.category}
          </span>
        </div>

        {/* Image Area with Loading State */}
        <div className="relative flex-1 bg-gray-100 overflow-hidden w-full">
          {/* Loading Overlay - Visible until image loads */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gray-200 z-20 transition-opacity duration-300 ${imageLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
             <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-blue mb-4"></div>
             <p className="text-brand-blue font-bold animate-pulse">Painting Portrait...</p>
          </div>
          
          {/* The Image */}
          <img 
            src={imageUrl} 
            alt={data.name}
            className={`w-full h-full object-cover transition-transform duration-700 ${imageLoaded ? 'scale-100' : 'scale-105'}`}
            onLoad={handleImageLoad}
            onError={(e) => {
              // Fallback if image fails
              handleImageLoad();
              (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image';
            }}
          />
          
          {/* Gradient Overlay for text readability */}
          <div className="absolute bottom-0 left-0 w-full h-3/4 bg-gradient-to-t from-white via-white/80 to-transparent z-10"></div>
        </div>

        {/* Content Area - Overlapping the image slightly */}
        <div className="absolute bottom-0 left-0 w-full p-4 z-30 flex flex-col items-center text-center pb-6">
          
          {/* The Answer (Name) */}
          <h2 className="text-4xl md:text-5xl font-black text-brand-dark leading-none drop-shadow-sm mb-4">
            {data.name}
          </h2>

          {/* Context Helper for Guesser */}
          <div className="w-full bg-brand-yellow/20 rounded-xl p-2 border-l-4 border-brand-yellow mb-3 backdrop-blur-md text-left">
            <p className="text-brand-dark/60 text-[10px] uppercase font-bold">Guesser Asks:</p>
            <p className="text-lg font-bold text-brand-dark">"{data.toBeContext}"</p>
          </div>

          {/* Clues List */}
          <div className="w-full text-left">
            <p className="text-gray-400 text-[10px] uppercase font-bold mb-1 text-center">Clues for Friends (Read Aloud)</p>
            <div className="space-y-2">
              {data.hints.map((hint, i) => (
                <div key={i} className="bg-gray-100/90 text-brand-dark px-3 py-2 rounded-lg text-sm font-semibold border-l-4 border-brand-green shadow-sm">
                  {hint}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};