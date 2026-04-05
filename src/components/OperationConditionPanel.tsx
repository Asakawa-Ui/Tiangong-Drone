import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ScatterChart, Scatter, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, ReferenceArea } from 'recharts';
import { ClipboardCheck } from 'lucide-react';
import DraggablePanel from './DraggablePanel';
import { api, OperationConditionData } from '../services/api';
import { Slider } from './ui/slider';

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

const CloudConcentrationLabel = ({ viewBox }: any) => {
  if (!viewBox) return null;
  const { x, y, width, height } = viewBox;
  return (
    <text
      x={x + 10}
      y={y + height / 2}
      transform={`rotate(-90, ${x + 10}, ${y + height / 2})`}
      textAnchor="middle"
      fill="#6B7280"
      fontSize={10}
    >
      N<tspan baselineShift="sub" fontSize="8">CDP</tspan>/cm<tspan baselineShift="super" fontSize="8">-3</tspan>
    </text>
  );
};

export default function OperationConditionPanel({ onClose, currentSortie, isVisible = true, isMapFullscreen = false }: { onClose: () => void, currentSortie?: any, isVisible?: boolean, isMapFullscreen?: boolean }) {
  const [isRealTime, setIsRealTime] = useState(true);
  const [timeFilter, setTimeFilter] = useState('全部');
  const [timeRange, setTimeRange] = useState<number[]>([0, 100]);
  const [data, setData] = useState<OperationConditionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const conditionData = await api.getOperationConditionData(currentSortie?.code);
      setData(conditionData);
      setTimeRange([0, Math.max(0, conditionData.length - 1)]);
    } catch (error) {
      console.error("Failed to fetch operation condition data", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentSortie?.code]);

  useEffect(() => {
    if (!isVisible) return;
    fetchData();
  }, [fetchData, isVisible]);

  const displayData = useMemo(() => {
    if (isRealTime) {
      if (timeFilter === '近30分钟') {
        return data.slice(-Math.min(data.length, 30 * 6)); // 10s per item -> 6 items per min
      } else if (timeFilter === '近60分钟') {
        return data.slice(-Math.min(data.length, 60 * 6));
      }
      return data;
    } else {
      return data.slice(timeRange[0], timeRange[1] + 1);
    }
  }, [data, isRealTime, timeFilter, timeRange]);

  const headerExtra = (
    <div className="flex p-1 space-x-1 bg-gray-100/80 rounded-full w-fit border border-gray-200/50 mr-2">
      <button
        onClick={() => {
          setIsRealTime(true);
          fetchData();
        }}
        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
          isRealTime
            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200/50'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isRealTime ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
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
      id="operation-condition"
      title={
        <>
          <ClipboardCheck size={18} className="text-blue-600" />
          <span>作业条件判断</span>
        </>
      }
      onClose={onClose}
      isVisible={isVisible}
      headerExtra={headerExtra}
      defaultPosition={{ x: isMapFullscreen ? 260 + 500 : 260, y: 48 }}
      defaultSize={{ width: 500, height: 544 }}
    >
      <div className="flex-1 flex flex-col min-h-0 bg-white relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
          {/* 模式切换与时间过滤 */}
          <div className="flex justify-start items-center shrink-0">
            {isRealTime && (
              <div className="flex justify-start gap-2">
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
            )}
          </div>
          {/* 入云情况图表 */}
          <div className="h-[120px] shrink-0 w-full flex flex-col">
            <div className="flex items-center gap-4 mb-1">
              <span className="text-sm font-bold text-black">入云情况:</span>
              <div className="flex items-center gap-3">
                <LegendItem color="#A855F7" label="冰云" />
                <LegendItem color="#3B82F6" label="混合云" />
                <LegendItem color="#22C55E" label="水云" />
                <LegendItem color="#9CA3AF" label="未入云" />
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 5, right: 15, left: 5, bottom: 0 }}>
                  {/* @ts-ignore */}
                  <ReferenceArea y1={1} y2={100} fill="#DBEAFE" fillOpacity={0.5} ifOverflow="hidden" />
                  {/* @ts-ignore */}
                  <ReferenceArea y1={0} y2={1} fill="#FEE2E2" fillOpacity={0.5} ifOverflow="hidden" />
                  <XAxis dataKey="index" type="number" hide domain={['dataMin', 'dataMax']} />
                  <YAxis dataKey="cloudConcentration" type="number" allowDecimals={false} tickCount={6} tickFormatter={(value) => Math.round(value).toString()} tick={{ fontSize: 10, fill: '#6B7280' }} width={35} axisLine={false} tickLine={false} padding={{ top: 5, bottom: 5 }} label={<CloudConcentrationLabel />} />
                  <Scatter data={displayData} shape={<CustomDot />}>
                    {displayData.map((entry: any, index: number) => (
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
                  <ReferenceArea y1={-5} y2={100} fill="#FFF1F2" fillOpacity={0.5} ifOverflow="hidden" />
                  {/* @ts-ignore */}
                  <ReferenceArea y1={-100} y2={-5} fill="#EFF6FF" fillOpacity={0.5} ifOverflow="hidden" />
                  
                  <XAxis dataKey="index" type="number" hide domain={['dataMin', 'dataMax']} />
                  <YAxis dataKey="temp" type="number" reversed={true} allowDecimals={false} tickCount={7} tickFormatter={(value) => Math.round(value).toString()} tick={{ fontSize: 10, fill: '#6B7280' }} width={35} axisLine={false} tickLine={false} padding={{ top: 5, bottom: 5 }} label={{ value: '温度/°C', angle: -90, position: 'insideLeft', offset: 5, fontSize: 10, fill: '#6B7280', style: { textAnchor: 'middle' } }} />
                  
                  <Scatter data={displayData} dataKey="temp" shape={<CustomDot />}>
                    {displayData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.conditionColor} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 作业方式图表 */}
          <div className="h-[140px] shrink-0 w-full flex flex-col">
            <div className="flex items-center gap-4 mb-1">
              <span className="text-sm font-bold text-black">作业方式:</span>
              <div className="flex items-center gap-3">
                <LegendItem color="#3B82F6" label="人工冰核" />
                <LegendItem color="#22C55E" label="致冷剂" />
                <LegendItem color="#F97316" label="吸湿剂" />
                <LegendItem color="#9CA3AF" label="其他" />
              </div>
            </div>
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 5, right: 15, left: 5, bottom: 0 }}>
                  {/* @ts-ignore */}
                  <ReferenceArea y1={2} y2={100} fill="#FFF1F2" fillOpacity={0.5} ifOverflow="hidden" />
                  {/* @ts-ignore */}
                  <ReferenceArea y1={-5} y2={2} fill="#DCFCE7" fillOpacity={0.5} ifOverflow="hidden" />
                  {/* @ts-ignore */}
                  <ReferenceArea y1={-100} y2={-5} fill="#EFF6FF" fillOpacity={0.5} ifOverflow="hidden" />
                  
                  <XAxis dataKey="index" type="number" hide domain={['dataMin', 'dataMax']} />
                  <YAxis dataKey="temp" type="number" reversed={true} allowDecimals={false} tickCount={7} tickFormatter={(value) => Math.round(value).toString()} tick={{ fontSize: 10, fill: '#6B7280' }} width={35} axisLine={false} tickLine={false} padding={{ top: 5, bottom: 5 }} label={{ value: '温度/°C', angle: -90, position: 'insideLeft', offset: 5, fontSize: 10, fill: '#6B7280', style: { textAnchor: 'middle' } }} />
                  
                  <Scatter data={displayData} dataKey="temp" shape={<CustomDot />}>
                    {displayData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.methodColor === '#9CA3AF' ? 'transparent' : entry.methodColor} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            {/* 推荐作业方式甘特图条 */}
            <div className="flex items-center w-full h-3 mt-1 mb-1">
              <div className="w-[40px] text-[10px] text-gray-500 text-right pr-1 shrink-0 leading-none">推荐</div>
              <div className="flex-1 flex h-full mr-[15px] rounded-sm overflow-hidden">
                {displayData.map((entry: any, index: number) => (
                  <div key={index} style={{ backgroundColor: ['#3B82F6', '#22C55E', '#F97316'].includes(entry.methodColor) ? entry.methodColor : 'transparent', flex: 1 }} title={`${entry.time} - ${entry.operationMethod}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 统一的底部时间轴 */}
        <div className="flex flex-col px-[31px] py-2 border-t border-gray-200 shrink-0 bg-white">
          <div className={`flex justify-between pl-[25px] text-[10px] text-gray-500 ${!isRealTime && data.length > 0 ? 'mb-2' : ''}`}>
            {displayData.length > 0 ? (
              <>
                <span>{displayData[0]?.time}</span>
                <span>{displayData[Math.floor(displayData.length * 0.25)]?.time}</span>
                <span>{displayData[Math.floor(displayData.length * 0.5)]?.time}</span>
                <span>{displayData[Math.floor(displayData.length * 0.75)]?.time}</span>
                <span>{displayData[displayData.length - 1]?.time}</span>
              </>
            ) : (
              <span className="w-full text-center"></span>
            )}
          </div>
          {!isRealTime && data.length > 0 && (
            <div className="px-[25px]">
              <Slider
                min={0}
                max={data.length - 1}
                step={1}
                value={timeRange}
                onValueChange={setTimeRange}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </DraggablePanel>
  );
}
