
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Quest } from '../types';
import { Loader2, Locate } from 'lucide-react';

// 1. World Tower Icon
const createTowerIcon = () => L.divIcon({
  html: `
    <div class="relative flex flex-col items-center justify-end w-0 h-0 overflow-visible pointer-events-none">
      <div class="absolute bottom-0 w-8 h-[150px] bg-gradient-to-t from-cyan-500/30 via-cyan-400/10 to-transparent blur-md rounded-full origin-bottom"></div>
      <div class="absolute bottom-0 w-1 h-[100px] bg-cyan-200/50 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
      <div class="absolute bottom-[-10px] w-32 h-8 bg-cyan-500/20 blur-xl rounded-full transform scale-x-150"></div>
    </div>
  `,
  className: 'tower-marker',
  iconSize: [0, 0],
  iconAnchor: [0, 0]
});

// 2. Region Labels
const createRegionLabel = (text: string, align: 'left' | 'right' | 'center' = 'center') => L.divIcon({
  html: `
    <div class="flex flex-col items-${align === 'left' ? 'start' : align === 'right' ? 'end' : 'center'} justify-center w-[200px] pointer-events-none select-none opacity-40 hover:opacity-100 transition-opacity">
        <h1 class="text-white/60 font-fantasy font-bold text-xs tracking-[0.3em] drop-shadow-md uppercase transform skew-x-[-10deg]">
            ${text}
        </h1>
        <div class="w-8 h-[1px] bg-white/30 mt-1"></div>
    </div>`,
  className: 'region-label',
  iconSize: [200, 30],
  iconAnchor: [100, 15]
});

// 3. Quest Marker
const createQuestIcon = (type: string, isFocused: boolean) => L.divIcon({
  html: `
    <div class="marker-float relative flex items-center justify-center w-0 h-0 overflow-visible transition-all duration-300 ${isFocused ? 'scale-125 z-50' : 'scale-100 z-10'}">
        <div class="relative w-12 h-12 bg-black/60 backdrop-blur-md border-2 ${isFocused ? 'border-fantasy-gold bg-fantasy-gold/20' : 'border-cyan-500/50'} rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] transform rotate-45 hover:scale-110 transition-transform hover:bg-white hover:border-white group cursor-pointer">
            <div class="transform -rotate-45 text-xl group-hover:scale-110 transition-transform filter drop-shadow-md">
                ${type === '魔物讨伐' ? '⚔️' : type === '物资运输' ? '📦' : type === '迷宫建设' ? '🏗️' : '⛑️'}
            </div>
        </div>
        <div class="absolute -bottom-10 w-8 h-2 bg-black/40 blur-sm rounded-full animate-pulse"></div>
        ${isFocused ? `<div class="absolute -top-14 bg-black/80 text-fantasy-gold text-[9px] px-2 py-1 rounded border border-fantasy-gold/30 whitespace-nowrap backdrop-blur font-bold tracking-widest shadow-lg animate-in slide-in-from-bottom-2">TARGET LOCKED</div>` : ''}
    </div>
  `,
  className: 'custom-quest-icon',
  iconSize: [0, 0],
  iconAnchor: [0, 0]
});

// 4. Player Navigation Marker
const createPlayerNavIcon = () => L.divIcon({
  html: `
    <div class="relative w-0 h-0 flex items-center justify-center">
       <div class="absolute w-6 h-6 bg-indigo-500 border-2 border-white rounded-full shadow-[0_0_15px_#6366f1] z-50"></div>
       <div class="absolute w-24 h-24 bg-indigo-500/20 rounded-full animate-ping opacity-50"></div>
       <div class="absolute w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[30px] border-b-indigo-400 transform -translate-y-6 opacity-80" style="filter: drop-shadow(0 0 5px #6366f1);"></div>
    </div>
  `,
  className: 'player-nav-icon',
  iconSize: [0, 0],
  iconAnchor: [0, 0]
});

interface MapBoardProps {
  quests: Quest[];
  activeQuestId: string | null;
  focusedQuestId: string | null;
  onFocus: (quest: Quest) => void;
  onAccept: (quest: Quest) => void;
  userLocation: [number, number] | null;
  isNavigating: boolean;
  showMarkers?: boolean; 
  onRecenter?: () => void;
}

const TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

// Improved Validation Helper
// Strictly ensures coords are arrays of 2 finite numbers
const isValidLatLng = (coords: any): coords is [number, number] => {
    if (!Array.isArray(coords)) return false;
    if (coords.length !== 2) return false;
    const [lat, lng] = coords;
    return typeof lat === 'number' && !isNaN(lat) && isFinite(lat) &&
           typeof lng === 'number' && !isNaN(lng) && isFinite(lng);
};

// Improved Controller to handle smooth tracking vs teleporting
const MapController: React.FC<{ center: [number, number], zoom: number, bounds?: L.LatLngBoundsExpression, isNavigating: boolean }> = ({ center, zoom, bounds, isNavigating }) => {
    const map = useMap();
    const prevCenter = useRef<[number, number] | null>(null);

    useEffect(() => {
        if (!map) return;
        
        if (bounds) {
             // Validate bounds (simple check if it's an array of valid latlngs)
             if (Array.isArray(bounds) && bounds.every(isValidLatLng)) {
                 map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
             }
        } else if (center && isValidLatLng(center)) {
            let shouldFly = true;
            if (prevCenter.current && isValidLatLng(prevCenter.current)) {
                try {
                    const dist = map.distance(prevCenter.current, center);
                    // If distance is small (< 100 meters), assume tracking -> use panTo (smoother)
                    if (dist < 100 && isNavigating) {
                        shouldFly = false;
                    }
                } catch (e) {
                    console.warn("Error calculating distance", e);
                }
            }
            
            try {
                if (shouldFly) {
                    map.flyTo(center, zoom, { duration: 1.5, easeLinearity: 0.2 });
                } else {
                    map.setView(center, zoom, { animate: true, duration: 0.5 });
                }
                prevCenter.current = center;
            } catch (e) {
                console.warn("Leaflet view update failed", e);
            }
        }
    }, [center, zoom, bounds, map, isNavigating]);
    return null;
};

// NEW: Location Button Component that uses useMap context
const LocationButton: React.FC<{ userLocation: [number, number] | null, onRecenter?: () => void }> = ({ userLocation, onRecenter }) => {
  const map = useMap();
  
  const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      
      // 1. Trigger the data update
      if (onRecenter) onRecenter(); 
      
      // 2. Force map view update immediately
      if (userLocation && isValidLatLng(userLocation)) {
          map.flyTo(userLocation, 17, { duration: 1.5 });
      }
  };

  if (!onRecenter) return null;

  return (
    <div className="absolute bottom-32 right-4 z-[400] pointer-events-auto">
        <button 
            onClick={handleClick}
            className="w-12 h-12 bg-black/80 backdrop-blur border border-white/20 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-all hover:bg-black hover:border-fantasy-gold group"
        >
            <Locate className="w-6 h-6 text-cyan-400 group-hover:text-fantasy-gold transition-colors" />
        </button>
    </div>
  );
};

const MapBoard: React.FC<MapBoardProps> = ({ 
  quests, activeQuestId, focusedQuestId, onFocus, onAccept, userLocation, isNavigating, showMarkers = false, onRecenter
}) => {
  const [isReady, setIsReady] = useState(false);
  
  const defaultCenter: [number, number] = [40.7484, -73.9857];
  
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  let mapCenter = isValidLatLng(userLocation) ? userLocation : defaultCenter;
  
  // Extra safety fallback
  if (!isValidLatLng(mapCenter)) {
      mapCenter = [40.7484, -73.9857];
  }

  let zoomLevel = 15; // Zoom in closer for navigation
  let mapBounds: L.LatLngBoundsExpression | undefined = undefined;

  const activeQuest = quests.find(q => q.id === activeQuestId);

  if (!isReady) {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-[#020408]">
            <Loader2 className="w-10 h-10 animate-spin text-fantasy-cyan" />
        </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-[#102a43] z-0 overflow-hidden">
        
        <MapContainer 
            center={mapCenter} 
            zoom={zoomLevel} 
            zoomControl={false} 
            attributionControl={false}
            className="w-full h-full"
            maxZoom={18}
            minZoom={12}
        >
            <TileLayer url={TILE_URL} className="fantasy-tiles opacity-90" />
            
            <MapController center={mapCenter} zoom={isNavigating ? 17 : 14} bounds={mapBounds} isNavigating={isNavigating} />
            
            {/* --- Static Elements --- */}
            <Marker position={[40.7484, -73.9857]} icon={createTowerIcon()} interactive={false} />
            <Marker position={[40.84, -73.91]} icon={createRegionLabel('THE BRONX', 'left')} interactive={false} />
            <Marker position={[40.73, -73.85]} icon={createRegionLabel('QUEENS', 'right')} interactive={false} />
            <Marker position={[40.69, -74.02]} icon={createRegionLabel('MATEN ISLAND', 'left')} interactive={false} />

            {/* --- Navigation Mode --- */}
            {activeQuest && isValidLatLng(userLocation) && isValidLatLng(activeQuest.location) && (
                <>
                    <Polyline 
                        positions={[userLocation, activeQuest.location]} 
                        pathOptions={{ 
                            color: '#06b6d4', 
                            weight: 6, 
                            opacity: 0.8, 
                            dashArray: '10, 10',
                            className: 'animate-dash' 
                        }} 
                    />
                    <Marker position={activeQuest.location} icon={createQuestIcon(activeQuest.type, true)} />
                    <Marker position={userLocation} icon={createPlayerNavIcon()} zIndexOffset={1000} />
                </>
            )}

            {/* --- Other Quests (Not Active) --- */}
            {!activeQuest && quests.map(quest => (
                isValidLatLng(quest.location) && (
                    <Marker 
                        key={quest.id}
                        position={quest.location} 
                        icon={createQuestIcon(quest.type, focusedQuestId === quest.id)}
                        eventHandlers={{
                            click: () => onFocus(quest)
                        }}
                    />
                )
            ))}

            {/* --- Controls --- */}
            <LocationButton userLocation={userLocation} onRecenter={onRecenter} />
            
        </MapContainer>
        
        {/* Atmosphere Overlays */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
             <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-black/60 mix-blend-overlay"></div>
             <div className="absolute inset-0 opacity-30 bg-[url('https://transparenttextures.com/patterns/foggy-birds.png')] mix-blend-screen animate-pulse" style={{animationDuration: '10s'}}></div>
             <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-cyan-300/10 via-transparent to-transparent rotate-12 pointer-events-none blur-3xl"></div>
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(2,6,23,0.6)_100%)]"></div>
        </div>

        <style>{`
          @keyframes dash {
            to { stroke-dashoffset: -20; }
          }
          .animate-dash {
            animation: dash 1s linear infinite;
          }
        `}</style>
    </div>
  );
};

export default MapBoard;
