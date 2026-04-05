import React, { useState, useEffect } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api, RadarData } from '../services/api';

export default function RadarProfileTab({ currentSortie, isRealTime = true }: { currentSortie?: any, isRealTime?: boolean }) {
  const [data, setData] = useState<RadarData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const radarData = await api.getRadarData(currentSortie?.code);
        setData(radarData);
      } catch (error) {
        console.error("Failed to fetch radar data", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentSortie, isRealTime]);

  return (
    <div className="flex-1 p-4 min-h-0 w-full h-full flex flex-col relative">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#6B7280' }} minTickGap={30} />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              stroke="#3B82F6" 
              tickCount={5}
              interval={0}
              tickFormatter={(value) => Math.round(value).toString()}
              tick={{ fontSize: 12 }}
              label={{ value: '高度 (km)', angle: -90, position: 'insideLeft', offset: 10 }} 
              domain={[0, 8]}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#EF4444" 
              tickCount={5}
              interval={0}
              tickFormatter={(value) => Math.round(value).toString()}
              tick={{ fontSize: 12 }}
              label={{ value: '温度 (°C)', angle: 90, position: 'insideRight', offset: 10 }} 
              domain={[-30, 50]}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="top" height={36} />
            
            {/* 雷达反射率用面积图模拟 */}
            <Area 
              yAxisId="left" 
              type="step" 
              dataKey="radar" 
              name="雷达反射率 (dBZ)" 
              fill="#8B5CF6" 
              stroke="none" 
              opacity={0.6} 
            />
            
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="altitude" 
              name="高度" 
              stroke="#3B82F6" 
              strokeWidth={2} 
              dot={false} 
              isAnimationActive={false}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="temperature" 
              name="温度" 
              stroke="#EF4444" 
              strokeWidth={2} 
              dot={false} 
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {/* 底部色标说明 */}
      <div className="h-10 flex items-center justify-center mt-2">
        <div className="flex items-center text-xs border border-gray-300 rounded overflow-hidden">
          <div className="px-2 py-1 bg-[#E0E7FF]">0-10</div>
          <div className="px-2 py-1 bg-[#93C5FD]">10-20</div>
          <div className="px-2 py-1 bg-[#3B82F6] text-white">20-30</div>
          <div className="px-2 py-1 bg-[#22C55E] text-white">30-40</div>
          <div className="px-2 py-1 bg-[#EAB308] text-white">40-50</div>
          <div className="px-2 py-1 bg-[#EF4444] text-white">50+</div>
          <div className="px-2 py-1 bg-white text-gray-600 font-medium">雷达反射率 (dBZ)</div>
        </div>
      </div>
    </div>
  );
}
