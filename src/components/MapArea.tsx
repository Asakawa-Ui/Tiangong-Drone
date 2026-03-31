import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker } from 'react-leaflet';
import { Maximize, Minimize, CloudLightning, Zap } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import GISFunctionShortcuts from './GISFunctionShortcuts';
import FlightParametersPanel from './FlightParametersPanel';
import OperationConditionPanel from './OperationConditionPanel';
import UavVideoPanel from './UavVideoPanel';
import MapChatDock from './MapChatDock';
import MapNotifications from './MapNotifications';
import { api } from '../services/api';

// Helper to create custom icons for tactical layers
const createTacticalIcon = (iconType: string, color: string) => {
  return L.divIcon({
    html: `<div style="color: ${color}; background: white; border-radius: 50%; padding: 4px; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
      ${iconType === 'convection' ? '⚡' : '🌩️'}
    </div>`,
    className: 'tactical-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

interface MapAreaProps {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  panelStates?: { flightParams: boolean; opCondition: boolean; uavVideo: boolean };
  setPanelStates?: React.Dispatch<React.SetStateAction<{ flightParams: boolean; opCondition: boolean; uavVideo: boolean }>>;
  currentSortie?: any;
  sortieVisibility?: Record<string, boolean>;
  isRouteVisible?: boolean;
  activeRoute?: string;
  activeLayers?: { danger1: boolean; danger2: boolean; potential1: boolean };
}

export default function MapArea({ isFullscreen, onToggleFullscreen, panelStates, setPanelStates, currentSortie, sortieVisibility, isRouteVisible = true, activeRoute = 'V1', activeLayers }: MapAreaProps) {
  const [sortieTrack, setSortieTrack] = useState<any>(null);
  const [planTrack, setPlanTrack] = useState<any>(null);
  const [dangerZones, setDangerZones] = useState<any>(null);
  const [potentialZones, setPotentialZones] = useState<any>(null);

  // Trigger map resize when fullscreen toggles
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // Fetch track data
  useEffect(() => {
    const fetchTracks = async () => {
      if (!currentSortie) return;
      
      const sTrack = await api.getSortieTrack(currentSortie.code);
      if (sTrack) {
        setSortieTrack(sTrack);
      } else {
        setSortieTrack(null);
      }
      
      const pTrack = await api.getPlanTrack(currentSortie.code, activeRoute);
      if (pTrack) {
        setPlanTrack(pTrack);
      } else {
        setPlanTrack(null);
      }
    };
    fetchTracks();
  }, [currentSortie, activeRoute]);

  // Fetch tactical layers
  useEffect(() => {
    const fetchTacticalLayers = async () => {
      const dZones = await api.getDangerZones();
      setDangerZones(dZones);
      
      const pZones = await api.getPotentialZones();
      setPotentialZones(pZones);
    };
    fetchTacticalLayers();
  }, []);

  return (
    <div className="w-full h-full relative z-0">
      <GISFunctionShortcuts />
      <MapNotifications isFullscreen={isFullscreen} currentSortie={currentSortie} />
      
      {/* Fullscreen Toggle Button */}
      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className="absolute top-4 right-[200px] z-[1000] uav-glass p-2 rounded-xl text-gray-700 hover:text-blue-600 transition-colors"
          title={isFullscreen ? "退出全屏" : "全屏地图"}
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      )}

      <FlightParametersPanel 
        isVisible={panelStates?.flightParams} 
        isMapFullscreen={isFullscreen}
        onClose={() => setPanelStates?.(prev => ({ ...prev, flightParams: false }))} 
        currentSortie={currentSortie} 
      />
      <OperationConditionPanel 
        isVisible={panelStates?.opCondition} 
        isMapFullscreen={isFullscreen}
        onClose={() => setPanelStates?.(prev => ({ ...prev, opCondition: false }))} 
        currentSortie={currentSortie} 
      />
      <UavVideoPanel 
        isVisible={panelStates?.uavVideo} 
        isMapFullscreen={isFullscreen}
        onClose={() => setPanelStates?.(prev => ({ ...prev, uavVideo: false }))} 
        currentSortie={currentSortie} 
      />
      <MapChatDock isFullscreen={isFullscreen} />
      <MapContainer
        center={[36.5, 100.3]}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* 渲染作业潜力区 */}
        {potentialZones && activeLayers?.potential1 && (
          <GeoJSON 
            data={potentialZones}
            style={(feature) => ({
              fillColor: feature?.properties.color || '#3B82F6',
              fillOpacity: 0.4,
              color: feature?.properties.color || '#3B82F6',
              weight: 2,
              dashArray: '3'
            })}
            onEachFeature={(feature, layer) => {
              layer.bindPopup(`
                <div class="p-2">
                  <h3 class="font-bold text-sm mb-1">${feature.properties.name}</h3>
                  <p class="text-xs text-gray-600">潜力等级: ${feature.properties.rating === 'excellent' ? '优' : '良'}</p>
                </div>
              `);
            }}
          />
        )}

        {/* 渲染危险区 */}
        {dangerZones && (
          <>
            {activeLayers?.danger1 && (
              <GeoJSON 
                data={{
                  ...dangerZones,
                  features: dangerZones.features.filter((f: any) => f.properties.type === 'convection')
                }}
                style={{
                  fillColor: '#EAB308',
                  fillOpacity: 0.5,
                  color: '#CA8A04',
                  weight: 2
                }}
                onEachFeature={(feature, layer) => {
                  layer.bindPopup(`
                    <div class="p-2">
                      <h3 class="font-bold text-sm mb-1 text-yellow-700">${feature.properties.name}</h3>
                      <p class="text-xs text-gray-600">危险等级: 高</p>
                    </div>
                  `);
                }}
              />
            )}
            {activeLayers?.danger1 && dangerZones.features.filter((f: any) => f.properties.type === 'convection').map((f: any, i: number) => (
              <Marker 
                key={`danger1-icon-${i}`}
                position={[f.geometry.coordinates[0][0][1], f.geometry.coordinates[0][0][0]]}
                icon={createTacticalIcon('convection', '#EAB308')}
              />
            ))}
            {activeLayers?.danger2 && (
              <GeoJSON 
                data={{
                  ...dangerZones,
                  features: dangerZones.features.filter((f: any) => f.properties.type === 'lightning')
                }}
                style={{
                  fillColor: '#F59E0B',
                  fillOpacity: 0.5,
                  color: '#D97706',
                  weight: 2
                }}
                onEachFeature={(feature, layer) => {
                  layer.bindPopup(`
                    <div class="p-2">
                      <h3 class="font-bold text-sm mb-1 text-amber-600">${feature.properties.name}</h3>
                      <p class="text-xs text-gray-600">危险等级: 中</p>
                    </div>
                  `);
                }}
              />
            )}
            {activeLayers?.danger2 && dangerZones.features.filter((f: any) => f.properties.type === 'lightning').map((f: any, i: number) => (
              <Marker 
                key={`danger2-icon-${i}`}
                position={[f.geometry.coordinates[0][0][1], f.geometry.coordinates[0][0][0]]}
                icon={createTacticalIcon('lightning', '#F59E0B')}
              />
            ))}
          </>
        )}
        
        {/* 渲染当前方案轨迹 (蓝色虚线) */}
        {planTrack && sortieVisibility?.[currentSortie?.id] !== false && isRouteVisible && (
          <GeoJSON 
            key={`plan-track-${currentSortie?.id}-${activeRoute}`}
            data={planTrack} 
            style={{
              color: '#3B82F6', // blue-500
              weight: 3,
              dashArray: '5, 10',
              opacity: 0.8
            }}
            onEachFeature={(feature, layer) => {
              if (feature.properties) {
                layer.bindPopup(`
                  <div class="p-2">
                    <h3 class="font-bold text-sm mb-1">方案轨迹</h3>
                    <p class="text-xs text-gray-600">方案ID: ${feature.properties.plan_id || '未知'}</p>
                    <p class="text-xs text-gray-600">版本: ${feature.properties.plan_ver || '未知'}</p>
                    <p class="text-xs text-gray-600">架次ID: ${feature.properties.sortie_id || '未知'}</p>
                  </div>
                `);
              }
            }}
          />
        )}

        {/* 渲染当前架次轨迹 (绿色实线) */}
        {sortieTrack && sortieVisibility?.[currentSortie?.id] !== false && (
          <GeoJSON 
            key={`sortie-track-${currentSortie?.id}`}
            data={sortieTrack} 
            style={{
              color: '#10B981', // emerald-500
              weight: 4,
              opacity: 0.9
            }}
            onEachFeature={(feature, layer) => {
              if (feature.properties) {
                layer.bindPopup(`
                  <div class="p-2">
                    <h3 class="font-bold text-sm mb-1">实况轨迹</h3>
                    <p class="text-xs text-gray-600">架次ID: ${feature.properties.sortie_id || '未知'}</p>
                    <p class="text-xs text-gray-600">飞机: ${feature.properties.plane_id || '未知'}</p>
                  </div>
                `);
              }
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
