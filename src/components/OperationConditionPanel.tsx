import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, ReferenceArea } from 'recharts';
import { ClipboardCheck } from 'lucide-react';
import DraggablePanel from './DraggablePanel';
import { api, OperationConditionData } from '../services/api';

const LegendItem = ({ color, label, isOutline = false }: { color: string, label: string, isOutline?: boolean }) => (
  <span className="flex items-center gap-1.5 text-xs text-black font-medium">
    {isOutline ? (
      <div className="w-6 h-3 border" style={{ borderColor: color }}></div>
    ) : (
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div>
    )}
    {label}
  </span>
);

const CustomDot = (props: any) => {
  const { cx, cy, fill } = props;
  return <circle cx={cx} cy={cy} r={2.5} fill={fill} />;
};

export default function OperationConditionPanel({ onClose, currentSortie, isVisible = true, isMapFullscreen = false }: { onClose: () => void, currentSortie?: any, isVisible?: boolean, isMapFullscreen?: boolean }) {
  const [timeFilter, setTimeFilter] = useState('全部');
  const [data, setData] = useState<OperationConditionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isVisible) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const conditionData = await api.getOperationConditionData(currentSortie?.code);
        setData(conditionData);
      } catch (error) {
        console.error("Failed to fetch operation condition data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentSortie]);

  return (
    <DraggablePanel
      id="operation-condition"
      title={
        <>
          <ClipboardCheck size={18} className="text-blue-600" />
          <span>作业条件判断</span>
        </>
      }
      onClose={onClose}
      isVisible={isVisible}
      defaultPosition={{ x: isMapFullscreen ? 260 + 500 : 260, y: 48 }}
      defaultSize={{ width: 500, height: 544 }}
    >
      <div className="flex-1 flex flex-col min-h-0 bg-white relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 text-gray-500">加载中...</div>
        ) : null}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
          {/* 时间过滤按钮 */}
          <div className="flex justify-start gap-2 shrink-0">
            {['近30分钟', '近60分钟', '全部'].map(filter => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-1 text-sm rounded transition-colors ${
                  timeFilter === filter
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-50 text-blue-500 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* 入云情况图表 */}
          <div className="h-[120px] shrink-0 w-full flex flex-col">
            <div className="flex items-center gap-4 mb-1">
              <span className="text-sm font-bold text-black">入云情况:</span>
              <div className="flex items-center gap-3">
                <LegendItem color="#3B82F6" label="已入云" />
                <LegendItem color="#F97316" label="未入云" />
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 5, right: 15, left: 5, bottom: 0 }}>
                  {/* @ts-ignore */}
                  <ReferenceArea y1={0} y2={100} fill="#EFF6FF" fillOpacity={1} />
                  <XAxis dataKey="index" type="number" hide domain={[0, 149]} />
                  <YAxis dataKey="cloudConcentration" domain={[0, 100]} tick={{ fontSize: 10, fill: '#6B7280' }} width={35} axisLine={false} tickLine={false} padding={{ top: 5, bottom: 5 }} label={{ value: '云滴浓度/cm-3', angle: -90, position: 'insideLeft', offset: 5, fontSize: 10, fill: '#6B7280', style: { textAnchor: 'middle' } }} />
                  <Scatter data={data} shape={<CustomDot />}>
                    {data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.cloudColor} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 作业条件等级图表 */}
          <div className="h-[120px] shrink-0 w-full flex flex-col">
            <div className="flex items-center gap-4 mb-1">
              <span className="text-sm font-bold text-black">作业条件等级:</span>
              <div className="flex items-center gap-3">
                <LegendItem color="#3B82F6" label="好" />
                <LegendItem color="#22C55E" label="较好" />
                <LegendItem color="#EAB308" label="一般" />
                <LegendItem color="#9CA3AF" label="不可播" />
              </div>
            </div>
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 5, right: 15, left: 5, bottom: 0 }}>
                  {/* @ts-ignore */}
                  <ReferenceArea y1={0} y2={20} fill="#FFF1F2" fillOpacity={0.5} />
                  {/* @ts-ignore */}
                  <ReferenceArea y1={-10} y2={0} fill="#EFF6FF" fillOpacity={0.5} />
                  
                  <XAxis dataKey="index" type="number" hide domain={[0, 149]} />
                  <YAxis dataKey="temp" reversed={true} domain={[-10, 20]} ticks={[-10, 0, 10, 20]} tick={{ fontSize: 10, fill: '#6B7280' }} width={35} axisLine={false} tickLine={false} padding={{ top: 5, bottom: 5 }} label={{ value: '温度/°C', angle: -90, position: 'insideLeft', offset: 5, fontSize: 10, fill: '#6B7280', style: { textAnchor: 'middle' } }} />
                  
                  <Scatter data={data} dataKey="temp" shape={<CustomDot />}>
                    {data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.conditionColor} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 作业方式图表 */}
          <div className="h-[120px] shrink-0 w-full flex flex-col">
            <div className="flex items-center gap-4 mb-1">
              <span className="text-sm font-bold text-black">作业方式:</span>
              <div className="flex items-center gap-3">
                <LegendItem color="#3B82F6" label="人工冰核" />
                <LegendItem color="#22C55E" label="致冷剂" />
                <LegendItem color="#F97316" label="吸湿剂" />
                <LegendItem color="#9CA3AF" label="未入云" />
              </div>
            </div>
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 5, right: 15, left: 5, bottom: 0 }}>
                  {/* @ts-ignore */}
                  <ReferenceArea y1={0} y2={20} fill="#FFF1F2" fillOpacity={0.5} />
                  {/* @ts-ignore */}
                  <ReferenceArea y1={-10} y2={0} fill="#F0FDF4" fillOpacity={0.5} />
                  
                  <XAxis dataKey="index" type="number" hide domain={[0, 149]} />
                  <YAxis dataKey="temp" reversed={true} domain={[-10, 20]} ticks={[-10, 0, 10, 20]} tick={{ fontSize: 10, fill: '#6B7280' }} width={35} axisLine={false} tickLine={false} padding={{ top: 5, bottom: 5 }} label={{ value: '温度/°C', angle: -90, position: 'insideLeft', offset: 5, fontSize: 10, fill: '#6B7280', style: { textAnchor: 'middle' } }} />
                  
                  <Scatter data={data} dataKey="temp" shape={<CustomDot />}>
                    {data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.methodColor} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 统一的底部时间轴 */}
        <div className="flex justify-between pl-[56px] pr-[31px] text-[10px] text-gray-500 py-2 border-t border-gray-200 shrink-0 bg-white">
          {data.length > 0 ? (
            <>
              <span>{data[0]?.time}</span>
              <span>{data[30]?.time}</span>
              <span>{data[60]?.time}</span>
              <span>{data[90]?.time}</span>
              <span>{data[120]?.time}</span>
              <span>{data[data.length - 1]?.time}</span>
            </>
          ) : (
            <span className="w-full text-center">加载中...</span>
          )}
        </div>
      </div>
    </DraggablePanel>
  );
}
