import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush
} from 'recharts';
import { X, Check, Plane, Radar, Cloud, AlertTriangle } from 'lucide-react';
import DraggablePanel from './DraggablePanel';
import RadarProfileTab from './RadarProfileTab';
import CloudParamsTab from './CloudParamsTab';
import IcingMonitorTab from './IcingMonitorTab';
import { api, FlightData } from '../services/api';

const metrics = [
  { key: 'altitude', name: '高度', color: '#00BFFF', unit: 'km', orientation: 'left', domain: [0, 16] },
  { key: 'humidity', name: '相对湿度', color: '#22C55E', unit: '%', orientation: 'left', domain: [0, 100] },
  { key: 'temperature', name: '温度', color: '#666666', unit: '°C', orientation: 'right', domain: [-20, 50] },
  { key: 'speed', name: '航速', color: '#EF4444', unit: 'km/h', orientation: 'right', domain: [0, 500] },
  { key: 'heading', name: '航向', color: '#1D4ED8', unit: '°', orientation: 'left', domain: [0, 360] },
];

export default function FlightParametersPanel({ onClose, currentSortie, isVisible = true, isMapFullscreen = false }: { onClose?: () => void, currentSortie?: any, isVisible?: boolean, isMapFullscreen?: boolean }) {
  const [activeTab, setActiveTab] = useState('飞行参数');
  const [isRealTime, setIsRealTime] = useState(true);
  const [data, setData] = useState<FlightData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleMetrics, setVisibleMetrics] = useState<Record<string, boolean>>({
    altitude: true,
    humidity: true,
    temperature: true,
    speed: true,
    heading: false,
  });

  useEffect(() => {
    if (!isVisible) return; // Don't fetch data if not visible
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const flightData = await api.getFlightData(currentSortie?.code);
        setData(flightData);
      } catch (error) {
        console.error("Failed to fetch flight data", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    if (isRealTime) {
      const interval = setInterval(fetchData, 3000);
      return () => clearInterval(interval);
    }
  }, [currentSortie, isVisible, isRealTime]);

  const toggleMetric = (key: string) => {
    setVisibleMetrics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 shadow-lg rounded p-3 text-sm">
          <p className="font-bold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="my-1">
              {entry.name}: {entry.value} {metrics.find(m => m.key === entry.dataKey)?.unit}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const tabs = [
    { id: '飞行参数', label: '飞行参数', icon: <Plane size={16} /> },
    { id: '雷达剖面', label: '雷达剖面', icon: <Radar size={16} /> },
    { id: '云参数', label: '云参数', icon: <Cloud size={16} /> },
    { id: '危险监测', label: '危险监测', icon: <AlertTriangle size={16} /> }
  ];

  const headerExtra = (
    <div className="flex p-1 space-x-1 bg-gray-100/80 rounded-full w-fit border border-gray-200/50 mr-2">
      <button
        onClick={() => setIsRealTime(true)}
        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
          isRealTime
            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200/50'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isRealTime ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></span>
        实时
      </button>
      <button
        onClick={() => setIsRealTime(false)}
        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
          !isRealTime
            ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${!isRealTime ? 'bg-gray-600' : 'bg-gray-300'}`}></span>
        非实时
      </button>
    </div>
  );

  return (
    <DraggablePanel
      id="flight-parameters"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
      isVisible={isVisible}
      headerExtra={headerExtra}
      defaultPosition={{ x: isMapFullscreen ? 767 + 500 : 767, y: 52 }}
      defaultSize={{ width: 648, height: 449 }}
      minWidth={400}
      minHeight={300}
    >
        {activeTab === '飞行参数' && (
          <>
            {/* 控制栏 (复选框 + 图例结合) */}
            <div className="flex flex-wrap items-center gap-6 px-4 py-3 bg-white/40 border-b border-gray-200/50 shrink-0">
              {metrics.map(metric => (
                <div
                  key={metric.key}
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => toggleMetric(metric.key)}
                >
                  {/* 自定义复选框 */}
                  <div 
                    className="w-4 h-4 rounded-sm flex items-center justify-center border transition-colors"
                    style={{ 
                      backgroundColor: visibleMetrics[metric.key] ? metric.color : 'transparent',
                      borderColor: visibleMetrics[metric.key] ? metric.color : '#D1D5DB'
                    }}
                  >
                    {visibleMetrics[metric.key] && <Check size={12} strokeWidth={3} color="white" />}
                  </div>
                  
                  {/* 颜色线段指示 (类似图例) */}
                  <div className="flex items-center w-6 justify-center relative">
                    <div className="w-full h-[2px]" style={{ backgroundColor: visibleMetrics[metric.key] ? metric.color : '#D1D5DB' }}></div>
                    <div className="w-2 h-2 rounded-full absolute" style={{ backgroundColor: visibleMetrics[metric.key] ? metric.color : '#D1D5DB' }}></div>
                  </div>

                  {/* 文本标签 */}
                  <span className="text-sm font-bold" style={{ color: visibleMetrics[metric.key] ? metric.color : '#9CA3AF' }}>
                    {metric.name}
                  </span>
                </div>
              ))}
            </div>

            {/* 图表区域 */}
            <div className="flex-1 p-4 pt-6 min-h-0 relative">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 text-gray-500">加载中...</div>
              ) : null}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12, fill: '#6B7280' }} 
                    tickMargin={10}
                    minTickGap={30}
                  />
                  
                  {metrics.map(metric => 
                    visibleMetrics[metric.key] && (
                      <YAxis 
                        key={metric.key}
                        yAxisId={metric.key} 
                        orientation={metric.orientation as any} 
                        stroke={metric.color} 
                        tickCount={5}
                        interval={0}
                        tickFormatter={(value) => Math.round(value).toString()}
                        tick={{ fontSize: 12 }}
                        domain={metric.domain}
                        label={{ 
                          value: metric.unit, 
                          position: 'top',
                          offset: 10,
                          fill: metric.color,
                          fontSize: 12
                        }}
                      />
                    )
                  )}

                  <Tooltip content={<CustomTooltip />} />

                  {metrics.map(metric => 
                    visibleMetrics[metric.key] && (
                      <Line
                        key={metric.key}
                        yAxisId={metric.key}
                        type="monotone"
                        dataKey={metric.key}
                        name={metric.name}
                        stroke={metric.color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                        isAnimationActive={false}
                      />
                    )
                  )}

                  <Brush 
                    dataKey="time" 
                    height={30} 
                    stroke="#3B82F6" 
                    fill="#EFF6FF"
                    tickFormatter={() => ''}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        
        {activeTab === '雷达剖面' && <RadarProfileTab currentSortie={currentSortie} isRealTime={isRealTime} />}
        {activeTab === '云参数' && <CloudParamsTab currentSortie={currentSortie} isRealTime={isRealTime} />}
        {activeTab === '危险监测' && <IcingMonitorTab currentSortie={currentSortie} isRealTime={isRealTime} />}
    </DraggablePanel>
  );
}
