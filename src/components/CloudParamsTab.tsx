import React, { useState, useEffect } from 'react';
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { api, CloudData } from '../services/api';

const CustomDot = (props: any) => {
  const { cx, cy, fill } = props;
  return <circle cx={cx} cy={cy} r={3} fill={fill} />;
};

const ChartRow = ({ dataKey, name, color, data, yDomain, chartType }: any) => (
  <div className="h-[120px] shrink-0 w-full flex flex-col relative group">
    <div className="flex justify-between items-center mb-1 ml-10 pr-4">
      <div className="text-xs font-bold text-black">{name}</div>
    </div>
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'line' ? (
          <LineChart data={data} margin={{ top: 5, right: 15, left: 5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="time" hide />
            <YAxis 
              domain={yDomain} 
              tick={{ fontSize: 10, fill: '#6B7280' }} 
              width={35} 
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              padding={{ top: 5, bottom: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={1.5} 
              dot={false} 
              isAnimationActive={false} 
            />
          </LineChart>
        ) : (
          <ScatterChart margin={{ top: 5, right: 15, left: 5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="time" type="category" hide />
            <YAxis 
              dataKey={dataKey}
              domain={yDomain} 
              tick={{ fontSize: 10, fill: '#6B7280' }} 
              width={35} 
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              padding={{ top: 5, bottom: 5 }}
            />
            <Scatter data={data} fill={color} shape={<CustomDot />} />
          </ScatterChart>
        )}
      </ResponsiveContainer>
    </div>
  </div>
);

export default function CloudParamsTab({ currentSortie }: { currentSortie?: any }) {
  const [activeSubTab, setActiveSubTab] = useState('CDP探头');
  const [chartType, setChartType] = useState<'line' | 'scatter'>('line');
  const [data, setData] = useState<CloudData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const cloudData = await api.getCloudData(currentSortie?.code);
        setData(cloudData);
      } catch (error) {
        console.error("Failed to fetch cloud data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentSortie]);

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-white min-h-0 relative">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 text-gray-500">加载中...</div>
      ) : null}
      {/* 二级 Tab 和 切换开关 */}
      <div className="h-10 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
        <div className="flex gap-6 h-full">
          {['CDP探头', 'CIP探头', 'PIP探头'].map(tab => (
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
        {activeSubTab === 'CDP探头' ? (
          <>
            <ChartRow 
              dataKey="diameter" 
              name="有效直径(μm)" 
              color="#1D4ED8" 
              data={data} 
              yDomain={[0, 40]} 
              chartType={chartType}
            />
            <ChartRow 
              dataKey="concentration" 
              name="数浓度(个/cm³)" 
              color="#1D4ED8" 
              data={data} 
              yDomain={[0, 1000]} 
              chartType={chartType}
            />
            <ChartRow 
              dataKey="lwc" 
              name="液水含量(g/m³)" 
              color="#1D4ED8" 
              data={data} 
              yDomain={[0, 0.7]} 
              chartType={chartType}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            暂无{activeSubTab}数据
          </div>
        )}
      </div>
      
      {/* 底部时间轴 */}
      <div className="flex justify-between pl-[56px] pr-[31px] text-[10px] text-gray-500 py-2 border-t border-gray-200 shrink-0 bg-white">
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
