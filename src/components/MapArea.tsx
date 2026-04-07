import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, ImageOverlay } from 'react-leaflet';
import { Maximize, Minimize, CloudLightning, Zap, Plane, X } from 'lucide-react';
import L, { LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from 'react-dom/server';
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
    html: `<div style="color: ${color}; background: white; border-radius: 50%; padding: 4px; border: 1px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
      ${iconType === 'convection' ? '⚡' : '🌩️'}
    </div>`,
    className: 'tactical-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Helper to create airplane icon with rotation
const createPlaneIcon = (heading: number) => {
  const iconHtml = renderToStaticMarkup(
    <div style={{ 
      transform: `rotate(${heading}deg)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.8)) drop-shadow(0 4px 8px rgba(0,0,0,0.4))'
    }}>
      <Plane size={80} fill="white" color="#1D4ED8" strokeWidth={0.5} />
    </div>
  );
  
  return L.divIcon({
    html: iconHtml,
    className: 'plane-icon',
    iconSize: [80, 80],
    iconAnchor: [40, 40]
  });
};

// Radar image bounds (example bounds for the demonstration)
const RADAR_BOUNDS: LatLngBoundsExpression = [
  [18.0, 73.0], // South West (covers most of China)
  [54.0, 135.0] // North East
];

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
  selectedAirspaceIds?: string[];
  setSelectedAirspaceIds?: React.Dispatch<React.SetStateAction<string[]>>;
  airspaceTimeRanges?: Record<string, string>;
  activeAirspaceLayer?: boolean;
  setActiveAirspaceLayer?: (visible: boolean) => void;
  setAirspaceTimeRanges?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export default function MapArea({ 
  isFullscreen, 
  onToggleFullscreen, 
  panelStates, 
  setPanelStates, 
  currentSortie, 
  sortieVisibility, 
  isRouteVisible = true, 
  activeRoute = 'V1', 
  activeLayers,
  selectedAirspaceIds = [],
  setSelectedAirspaceIds,
  airspaceTimeRanges = {},
  activeAirspaceLayer = false,
  setActiveAirspaceLayer,
  setAirspaceTimeRanges
}: MapAreaProps) {
  const [sortieTrack, setSortieTrack] = useState<any>(null);
  const [planTrack, setPlanTrack] = useState<any>(null);
  const [dangerZones, setDangerZones] = useState<any>(null);
  const [potentialZones, setPotentialZones] = useState<any>(null);
  const [planePosition, setPlanePosition] = useState<[number, number] | null>(null);
  const [planeHeading, setPlaneHeading] = useState<number>(0);
  const [showRadar, setShowRadar] = useState(true);
  const [latestTelemetry, setLatestTelemetry] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<string>(
    `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
  );

  // Update current time every minute for airspace status
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Trigger map resize when fullscreen toggles
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // Fetch track data with real-time update
  useEffect(() => {
    const fetchTracks = async () => {
      if (!currentSortie) return;
      
      const sTrack = await api.getSortieTrack(currentSortie.code);
      if (sTrack) {
        setSortieTrack(sTrack);
        
        // Extract plane position and heading from track
        try {
          const coordinates = sTrack.features?.[0]?.geometry?.coordinates || sTrack.geometry?.coordinates;
          if (coordinates && coordinates.length >= 1) {
            const lastPoint = coordinates[coordinates.length - 1];
            setPlanePosition([lastPoint[1], lastPoint[0]]); // [lat, lng]
            
            if (coordinates.length >= 2) {
              const prevPoint = coordinates[coordinates.length - 2];
              // Calculate heading (bearing)
              const lat1 = prevPoint[1] * Math.PI / 180;
              const lon1 = prevPoint[0] * Math.PI / 180;
              const lat2 = lastPoint[1] * Math.PI / 180;
              const lon2 = lastPoint[0] * Math.PI / 180;
              
              const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
              const x = Math.cos(lat1) * Math.sin(lat2) -
                Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
              const brng = Math.atan2(y, x);
              const heading = (brng * 180 / Math.PI + 360) % 360;
              setPlaneHeading(heading);
            }
          }
        } catch (e) {
          console.error("Error processing track for plane position:", e);
        }
      } else {
        setSortieTrack(null);
        setPlanePosition(null);
      }
      
      const pTrack = await api.getPlanTrack(currentSortie.code, activeRoute);
      if (pTrack) {
        setPlanTrack(pTrack);
      } else {
        setPlanTrack(null);
      }

      const flightData = await api.getFlightData(currentSortie.code);
      if (flightData && flightData.length > 0) {
        setLatestTelemetry(flightData[flightData.length - 1]);
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

  // Generate Airspace Grids
  const airspaceGrids = React.useMemo(() => {
    const features = [];
    // 扩大起始坐标和网格大小以覆盖整个青海省及周边
    // 青海省大致范围：北纬31°-39°，东经89°-103°
    const startLat = 31.0;
    const startLng = 88.0;
    const cellSizeLat = 1.6; // 纬度跨度约8度，5行每行1.6
    const cellSizeLng = 3.0; // 经度跨度约14度，5列每列3.0
    
    for (let i = 0; i < 26; i++) {
      const row = Math.floor(i / 5);
      const col = i % 5;
      
      const lat = startLat + row * cellSizeLat;
      const lng = startLng + col * cellSizeLng;
      
      features.push({
        type: 'Feature',
        id: `region-${i + 1}`,
        properties: {
          id: String(i + 1).padStart(2, '0'),
          name: `空域 ${String(i + 1).padStart(2, '0')}`,
          center: [lat + cellSizeLat / 2, lng + cellSizeLng / 2]
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [lng, lat],
            [lng + cellSizeLng, lat],
            [lng + cellSizeLng, lat + cellSizeLat],
            [lng, lat + cellSizeLat],
            [lng, lat]
          ]]
        }
      });
    }
    return { type: 'FeatureCollection', features };
  }, []);

  const isTimeActive = (timeRange: string) => {
    if (!timeRange) return false;
    const [start, end] = timeRange.split(' - ');
    return currentTime >= start && currentTime <= end;
  };

  const handleAirspaceClick = (id: string) => {
    if (!setSelectedAirspaceIds) return;
    setSelectedAirspaceIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full h-full relative z-0">
      <GISFunctionShortcuts 
        onRadarToggle={(visible) => setShowRadar(visible)} 
        isRadarVisible={showRadar}
        activeAirspaceLayer={activeAirspaceLayer}
        setActiveAirspaceLayer={setActiveAirspaceLayer}
      />
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
        center={[35.5, 96.0]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="http://t{s}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=1d3ede6b2f0e89e9eed057f2424239a3"
          subdomains={['0', '1', '2', '3', '4', '5', '6', '7']}
        />
        <TileLayer
          url="http://t{s}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=1d3ede6b2f0e89e9eed057f2424239a3"
          subdomains={['0', '1', '2', '3', '4', '5', '6', '7']}
        />
        
        {/* 雷达反射率图层 */}
        {showRadar && (
          <ImageOverlay
            url="/radar_ref.png"
            bounds={RADAR_BOUNDS}
            opacity={0.7}
            zIndex={1000}
          />
        )}
        
        {/* 渲染空域网格 (默认显示，在气象产品之上，战术图层之下) */}
        <GeoJSON 
          key={`airspace-grids-${currentTime}-${selectedAirspaceIds.join(',')}`}
          data={airspaceGrids as any}
          style={(feature) => {
            const id = feature?.id as string;
            const isSelected = selectedAirspaceIds.includes(id);
            const timeRange = airspaceTimeRanges[id];
            const isActive = isSelected && timeRange && isTimeActive(timeRange);
            
            return {
              fillColor: isActive ? '#10B981' : (isSelected ? '#3B82F6' : 'transparent'),
              fillOpacity: (isActive || isSelected) ? 0.05 : 0,
              color: isActive ? '#059669' : (isSelected ? '#2563EB' : '#94A3B8'),
              weight: (isActive || isSelected) ? 2 : 1,
              dashArray: ''
            };
          }}
        />
        {airspaceGrids.features.map((f: any) => (
          <Marker 
            key={`label-${f.id}`}
            position={f.properties.center}
            icon={L.divIcon({
              html: `<div class="flex flex-col items-center justify-center">
                <span class="text-[10px] font-bold ${selectedAirspaceIds.includes(f.id) ? 'text-blue-700' : 'text-gray-500'} bg-white/80 px-1 rounded shadow-sm">${f.properties.id}</span>
              </div>`,
              className: 'airspace-label',
              iconSize: [30, 20],
              iconAnchor: [15, 10]
            })}
            interactive={false}
          />
        ))}
        
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
                <div style="min-width: 160px; padding: 4px;">
                  <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #1f2937;">${feature.properties.name}</h3>
                  <p style="font-size: 12px; color: #4b5563; margin: 2px 0;">潜力等级: ${feature.properties.rating === 'excellent' ? '优' : '良'}</p>
                  <p style="font-size: 12px; color: #4b5563; margin: 2px 0;">生效时间: 14:00 - 18:00</p>
                </div>
              `, { minWidth: 160 });
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
                    <div style="min-width: 160px; padding: 4px;">
                      <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #b45309;">${feature.properties.name}</h3>
                      <p style="font-size: 12px; color: #4b5563; margin: 2px 0;">危险等级: 高</p>
                      <p style="font-size: 12px; color: #4b5563; margin: 2px 0;">生效时间: 12:00 - 16:00</p>
                    </div>
                  `, { minWidth: 160 });
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
                    <div style="min-width: 160px; padding: 4px;">
                      <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #92400e;">${feature.properties.name}</h3>
                      <p style="font-size: 12px; color: #4b5563; margin: 2px 0;">危险等级: 中</p>
                      <p style="font-size: 12px; color: #4b5563; margin: 2px 0;">生效时间: 13:30 - 15:30</p>
                    </div>
                  `, { minWidth: 160 });
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
              weight: 1.5,
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
          <>
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
            {planePosition && (
              <Marker 
                position={planePosition}
                icon={createPlaneIcon(planeHeading)}
                zIndexOffset={1000}
              >
                <Popup>
                  <div className="p-3 min-w-[200px] bg-white rounded-lg space-y-2">
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px]">
                      <div className="text-gray-500">架次编号</div>
                      <div className="text-gray-900 font-medium truncate">{currentSortie?.code}</div>
                      
                      <div className="text-gray-500">当前航向</div>
                      <div className="text-gray-900 font-medium">{Math.round(planeHeading)}°</div>
                      
                      <div className="text-gray-500">高度</div>
                      <div className="text-gray-900 font-medium">{latestTelemetry?.altitude || '--'} km</div>
                      
                      <div className="text-gray-500">温度</div>
                      <div className="text-gray-900 font-medium">{latestTelemetry?.temperature || '--'} °C</div>
                      
                      <div className="text-gray-500">湿度</div>
                      <div className="text-gray-900 font-medium">{latestTelemetry?.humidity || '--'} %</div>

                      <div className="text-gray-500">经度</div>
                      <div className="text-gray-900 font-medium">{planePosition[1].toFixed(5)}</div>
                      
                      <div className="text-gray-500">纬度</div>
                      <div className="text-gray-900 font-medium">{planePosition[0].toFixed(5)}</div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider">关联方案</div>
                      <div className="text-[11px] text-gray-700 font-medium leading-tight">
                        {currentSortie?.planName || '未关联方案'}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
}
