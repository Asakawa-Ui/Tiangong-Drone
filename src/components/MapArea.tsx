import React, { useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Maximize, Minimize } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import GISFunctionShortcuts from './GISFunctionShortcuts';
import FlightParametersPanel from './FlightParametersPanel';
import OperationConditionPanel from './OperationConditionPanel';
import UavVideoPanel from './UavVideoPanel';
import MapChatDock from './MapChatDock';
import MapNotifications from './MapNotifications';

interface MapAreaProps {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  panelStates?: { flightParams: boolean; opCondition: boolean; uavVideo: boolean };
  setPanelStates?: React.Dispatch<React.SetStateAction<{ flightParams: boolean; opCondition: boolean; uavVideo: boolean }>>;
}

export default function MapArea({ isFullscreen, onToggleFullscreen, panelStates, setPanelStates }: MapAreaProps) {
  // Trigger map resize when fullscreen toggles
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  return (
    <div className="w-full h-full relative z-0">
      <GISFunctionShortcuts />
      <MapNotifications isFullscreen={isFullscreen} />
      
      {/* Fullscreen Toggle Button */}
      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className="absolute top-4 right-[200px] z-[1000] bg-white p-2 rounded shadow-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors border border-gray-200"
          title={isFullscreen ? "退出全屏" : "全屏地图"}
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      )}

      {panelStates?.flightParams && (
        <FlightParametersPanel onClose={() => setPanelStates?.(prev => ({ ...prev, flightParams: false }))} />
      )}
      {panelStates?.opCondition && (
        <OperationConditionPanel onClose={() => setPanelStates?.(prev => ({ ...prev, opCondition: false }))} />
      )}
      {panelStates?.uavVideo && (
        <UavVideoPanel onClose={() => setPanelStates?.(prev => ({ ...prev, uavVideo: false }))} />
      )}
      <MapChatDock />
      <MapContainer
        center={[35.8617, 104.1954]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}
