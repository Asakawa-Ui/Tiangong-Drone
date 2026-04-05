import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { api, IcingData } from '../services/api';

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <span className="flex items-center gap-1.5 text-xs text-gray-600">
    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div>
    {label}
  </span>
);

const CustomDot = (props: any) => {
  const { cx, cy, fill } = props;
  return <circle cx={cx} cy={cy} r={3} fill={fill} />;
};

const ChartRow = ({ dataKey, name, data, yDomain, chartType, lineStroke = "#EF4444" }: any) => (
  <div className="h-[120px] shrink-0 w-full flex flex-col relative group">
    <div className="flex items-center justify-between mb-1 ml-10 pr-4">
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium text-gray-700 w-16">{name}</span>
        <div className="flex items-center gap-2">
          <LegendItem color="#9CA3AF" label="无" />
          <LegendItem color="#06B6D4" label="轻" />
          <LegendItem color="#3B82F6" label="中" />
          <LegendItem color="#EF4444" label="重" />
        </div>
      </div>
    </div>
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'line' ? (
          <ComposedChart data={data} margin={{ top: 5, right: 15, left: 5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="index" type="number" hide domain={[0, 149]} />
            <YAxis domain={yDomain} tick={{ fontSize: 10, fill: '#6B7280' }} width={35} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} padding={{ top: 5, bottom: 5 }} />
            <Line type="monotone" dataKey={dataKey} stroke={lineStroke} strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Scatter data={data} dataKey={dataKey} shape={<CustomDot />}>
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Scatter>
          </ComposedChart>
        ) : (
          <ScatterChart margin={{ top: 5, right: 15, left: 5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="index" type="number" hide domain={[0, 149]} />
            <YAxis dataKey={dataKey} domain={yDomain} tick={{ fontSize: 10, fill: '#6B7280' }} width={35} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} padding={{ top: 5, bottom: 5 }} />
            <Scatter data={data} shape={<CustomDot />}>
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Scatter>
          </ScatterChart>
        )}
      </ResponsiveContainer>
    </div>
  </div>
);

export default function IcingMonitorTab({ currentSortie, isRealTime = true }: { currentSortie?: any, isRealTime?: boolean }) {
  const [activeSubTab, setActiveSubTab] = useState('积冰监测');
  const [chartType, setChartType] = useState<'line' | 'scatter'>('scatter');
  const [data, setData] = useState<IcingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const icingData = await api.getIcingData(currentSortie?.code);
        setData(icingData);
      } catch (error) {
        console.error("Failed to fetch icing data", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    if (isRealTime) {
      const interval = setInterval(fetchData, 3000);
      return () => clearInterval(interval);
    }
  }, [currentSortie, isRealTime]);

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-white min-h-0 relative">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 text-gray-500">加载中...</div>
      ) : null}
      {/* 二级 Tab 和 切换开关 */}
      <div className="h-10 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
        <div className="flex gap-6 h-full">
          {['积冰监测', '侧风监测'].map(tab => (
            <div
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`h-full flex items-center cursor-pointer text-sm font-medium transition-colors border-b-2 ${
                activeSubTab === tab
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab}
            </div>
          ))}
        </div>
        
        {/* 曲线/散点 切换开关 */}
        <div className="flex items-center bg-gray-100 rounded-full p-0.5">
          <button
            onClick={() => setChartType('line')}
            className={`px-4 py-1 text-xs font-medium rounded-full transition-all ${
              chartType === 'line' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            曲线
          </button>
          <button
            onClick={() => setChartType('scatter')}
            className={`px-4 py-1 text-xs font-medium rounded-full transition-all ${
              chartType === 'scatter' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            散点
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
        {activeSubTab === '积冰监测' ? (
          <>
            <ChartRow dataKey="xgb1" name="XGB1" data={data} yDomain={[0, 2.5]} chartType={chartType} lineStroke="#9CA3AF" />
            <ChartRow dataKey="xgb2" name="XGB2" data={data} yDomain={[0, 2.5]} chartType={chartType} lineStroke="#9CA3AF" />
            <ChartRow dataKey="icingIndex" name="积冰指数" data={data} yDomain={[-8, 0]} chartType={chartType} lineStroke="#9CA3AF" />
            <ChartRow dataKey="icIndex" name="IC指数" data={data} yDomain={[0, 500]} chartType={chartType} lineStroke="#EF4444" />
            <ChartRow dataKey="icImproved" name="IC改进" data={data} yDomain={[0, 1]} chartType={chartType} lineStroke="#9CA3AF" />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            暂无{activeSubTab}数据
          </div>
        )}
      </div>
      
      {/* 底部时间轴 */}
      <div className="flex justify-between pl-[56px] pr-[31px] text-xs text-gray-500 py-2 border-t border-gray-200 shrink-0 bg-white">
        {data.length > 0 ? (
          <>
            <span>{data[0]?.time}</span>
            <span>{data[Math.floor(data.length / 4)]?.time}</span>
            <span>{data[Math.floor(data.length / 2)]?.time}</span>
            <span>{data[Math.floor(data.length * 3 / 4)]?.time}</span>
            <span>{data[data.length - 1]?.time}</span>
          </>
        ) : (
          <span className="w-full text-center">加载中...</span>
        )}
      </div>
    </div>
  );
}
