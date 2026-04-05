import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plane, Route, MoreVertical, Settings, ChevronLeft, X, Check } from 'lucide-react';
import './WorkspaceLeft.css';
import { Radio, Switch } from './ui/SelectionControls';
import Button from './ui/Button';
import { api, Airspace, Sortie, Plan } from '../services/api';
import DraggableAttachmentItem from './DraggableAttachmentItem';
import { AttachmentObjectType } from '../types/attachment';

function CustomTimePicker({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + 4,
          left: rect.left + rect.width / 2
        });
      }
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const [hour, minute] = value.split(':');

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className="relative flex-1" ref={triggerRef}>
      <div 
        className="bg-[#F0F4FA] rounded-md px-2 py-1 text-[12px] font-bold text-[#1F2937] cursor-pointer text-center hover:bg-[#E4E9F2] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value}
      </div>
      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="time-picker-dropdown fixed uav-glass rounded-xl p-2 z-[9999] flex gap-2 w-[120px]"
          style={{ top: coords.top, left: coords.left, transform: 'translateX(-50%)' }}
        >
          <div className="flex-1 h-[200px] overflow-y-auto custom-scrollbar pr-1">
            {hours.map(h => (
              <div 
                key={h}
                className={`text-center py-1 text-[12px] cursor-pointer rounded-md ${h === hour ? 'bg-[#2F63F6] text-white font-bold' : 'hover:bg-[#F0F4FA] text-[#5B6575]'}`}
                onClick={() => {
                  onChange(`${h}:${minute}`);
                }}
              >
                {h}
              </div>
            ))}
          </div>
          <div className="w-[1px] bg-gray-100 shrink-0"></div>
          <div className="flex-1 h-[200px] overflow-y-auto custom-scrollbar pr-1">
            {minutes.map(m => (
              <div 
                key={m}
                className={`text-center py-1 text-[12px] cursor-pointer rounded-md ${m === minute ? 'bg-[#2F63F6] text-white font-bold' : 'hover:bg-[#F0F4FA] text-[#5B6575]'}`}
                onClick={() => {
                  onChange(`${hour}:${m}`);
                  setIsOpen(false);
                }}
              >
                {m}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function MoreMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="more-wrap relative no-drag" ref={menuRef}>
      <button 
        className="more-btn" 
        aria-label="更多"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreVertical size={18} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-24 uav-glass rounded-2xl p-1.5 z-50 flex flex-col gap-1">
          <button className="px-3 py-2 text-[13px] text-[#4b5563] hover:bg-white/50 rounded-xl text-center font-bold transition-colors">编辑</button>
          <button className="px-3 py-2 text-[13px] text-[#e14d39] hover:bg-red-50/50 rounded-xl text-center font-bold transition-colors">删除</button>
        </div>
      )}
    </div>
  );
}

interface WorkspaceLeftProps {
  panelStates?: {
    flightParams: boolean;
    opCondition: boolean;
    uavVideo: boolean;
  };
  setPanelStates?: React.Dispatch<React.SetStateAction<{
    flightParams: boolean;
    opCondition: boolean;
    uavVideo: boolean;
  }>>;
  currentSortie?: Sortie | null;
  setCurrentSortie?: React.Dispatch<React.SetStateAction<Sortie | null>>;
  sortieVisibility?: Record<string, boolean>;
  setSortieVisibility?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  isRouteVisible?: boolean;
  setIsRouteVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  activeRoute?: string;
  setActiveRoute?: React.Dispatch<React.SetStateAction<string>>;
  activeLayers: { danger1: boolean; danger2: boolean; potential1: boolean };
  setActiveLayers: React.Dispatch<React.SetStateAction<{ danger1: boolean; danger2: boolean; potential1: boolean }>>;
  selectedAirspaceIds: string[];
  setSelectedAirspaceIds: React.Dispatch<React.SetStateAction<string[]>>;
  airspaceTimeRanges: Record<string, string>;
  setAirspaceTimeRanges: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  activeAirspaceLayer: boolean;
  setActiveAirspaceLayer: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function WorkspaceLeft({ 
  panelStates, 
  setPanelStates,
  currentSortie,
  setCurrentSortie,
  sortieVisibility,
  setSortieVisibility,
  isRouteVisible = true,
  setIsRouteVisible,
  activeRoute = 'V1',
  setActiveRoute,
  activeLayers,
  setActiveLayers,
  selectedAirspaceIds,
  setSelectedAirspaceIds,
  airspaceTimeRanges,
  setAirspaceTimeRanges,
  activeAirspaceLayer,
  setActiveAirspaceLayer
}: WorkspaceLeftProps) {
  const [activeSortieTab, setActiveSortieTab] = useState('current'); // 'current' | 'plan'
  const [activeRecordTab, setActiveRecordTab] = useState('record'); // 'record' | 'route' | 'layer'
  // const [isRouteVisible, setIsRouteVisible] = useState(true); // Removed local state
  // const [activeRoute, setActiveRoute] = useState('V2'); // Removed local state
  // const [activeLayers, setActiveLayers] = useState({ // Removed local state
  //   danger1: true,
  //   danger2: false,
  //   potential1: true
  // });

  const [airspaces, setAirspaces] = useState<Airspace[]>([]);
  // const [currentSortie, setCurrentSortie] = useState<Sortie | null>(null); // Removed local state
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [expandedView, setExpandedView] = useState<'none' | 'sortie' | 'plan'>('none');
  const [sorties, setSorties] = useState<Sortie[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  // const [sortieVisibility, setSortieVisibility] = useState<Record<string, boolean>>({ // Removed local state
  //   s1: true,
  //   s2: true,
  //   s3: false
  // });
  const [isAirspaceSettingsOpen, setIsAirspaceSettingsOpen] = useState(false);
  const airspaceSettingsRef = useRef<HTMLDivElement>(null);
  const timelineBoxRef = useRef<HTMLDivElement>(null);

  // New states for selected airspaces
  // const [selectedAirspaceIds, setSelectedAirspaceIds] = useState<string[]>([]);
  // const [airspaceTimeRanges, setAirspaceTimeRanges] = useState<Record<string, string>>({});
  const [selectedAirspaceId, setSelectedAirspaceId] = useState<string | null>(null);

  const allAvailableAirspaces = Array.from({ length: 26 }, (_, i) => ({
    id: `region-${i + 1}`,
    name: `空域 ${String(i + 1).padStart(2, '0')}`,
    timeRange: '08:00 - 12:00'
  }));

  const handleAirspaceToggle = (id: string) => {
    setSelectedAirspaceIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleStartTimeChange = (id: string, newStart: string) => {
    const currentRange = airspaceTimeRanges[id] || allAvailableAirspaces.find(a => a.id === id)?.timeRange || "08:00 - 12:00";
    const parts = currentRange.split(" - ");
    const end = parts.length > 1 ? parts[1] : "12:00";
    setAirspaceTimeRanges(prev => ({ ...prev, [id]: `${newStart} - ${end}` }));
  };

  const handleEndTimeChange = (id: string, newEnd: string) => {
    const currentRange = airspaceTimeRanges[id] || allAvailableAirspaces.find(a => a.id === id)?.timeRange || "08:00 - 12:00";
    const parts = currentRange.split(" - ");
    const start = parts.length > 0 ? parts[0] : "08:00";
    setAirspaceTimeRanges(prev => ({ ...prev, [id]: `${start} - ${newEnd}` }));
  };

  // Derived airspaces for display
  const activeAirspaces = allAvailableAirspaces
    .filter(a => selectedAirspaceIds.includes(a.id))
    .map(a => ({
      ...a,
      timeRange: airspaceTimeRanges[a.id] || a.timeRange
    }));

  useEffect(() => {
    if (activeRecordTab === 'record' && timelineBoxRef.current) {
      timelineBoxRef.current.scrollTop = timelineBoxRef.current.scrollHeight;
    }
  }, [activeRecordTab]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        airspaceSettingsRef.current && 
        !airspaceSettingsRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.time-picker-dropdown')
      ) {
        setIsAirspaceSettingsOpen(false);
      }
    }
    if (isAirspaceSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAirspaceSettingsOpen]);

  // Set initial selected airspace when data loads
  useEffect(() => {
    if (airspaces.length > 0 && !selectedAirspaceId) {
      setSelectedAirspaceId(airspaces[0].id);
    }
  }, [airspaces, selectedAirspaceId]);

  const handleAirspaceSelect = (id: string) => {
    setSelectedAirspaceId(id);
    setIsAirspaceSettingsOpen(false);
  };

  const routeVersions = [
    { id: 'V4', name: '应急绕飞航线', time: '12:37' },
    { id: 'V3', name: '应急响应预案', time: '11:30' },
    { id: 'V2', name: '标准巡检路线', time: '10:00' },
    { id: 'V1', name: '初始地形扫描', time: '08:15' },
  ];

  useEffect(() => {
    if (activeRoute && plans.length > 0) {
      const info = routeVersions.find(v => v.id === activeRoute);
      if (info) {
        setCurrentPlan({
          id: 'p-' + activeRoute,
          name: '青海外场试飞计划方案',
          version: activeRoute,
          updateTime: info.time,
          status: '当前'
        });
      }
    }
  }, [activeRoute, plans]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [airspacesData, sortieData, planData, sortiesList, plansList] = await Promise.all([
          api.getAirspaces(),
          api.getCurrentSortie(),
          api.getCurrentPlan(),
          api.getSorties(),
          api.getPlans()
        ]);
        setAirspaces(airspacesData);
        setCurrentSortie?.(sortieData);
        // Sync activeRoute with initial currentPlan if not already set
        if (planData && !activeRoute) {
          setActiveRoute?.(planData.version);
        }
        setCurrentPlan(planData);
        setSorties(sortiesList);
        setPlans(plansList);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <aside className="workspace-left">
      {/* 左上角：当前空域 & 当前架次/方案 */}
      <div 
        className="left-top flex gap-4 h-[260px] relative" 
        style={{ 
          overflow: 'visible', 
          zIndex: isAirspaceSettingsOpen ? 1001 : 1 
        }}
      >
        
        {/* 展开状态下的统一面板 */}
        {expandedView !== 'none' ? (
          <section className="workspace-card uav-glass flex flex-col flex-1 min-h-0 overflow-hidden relative">
            <div className="panel-inner w-full flex flex-col h-full">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <span className="text-[16px] font-bold text-[#1F2937]">
                  {expandedView === 'sortie' ? '实况架次列表' : '飞行方案列表'}
                </span>
                <button 
                  onClick={() => setExpandedView('none')}
                  className="px-4 py-1 bg-[#F0F4FA] text-[#5B6575] hover:bg-[#E4E9F2] rounded-lg transition-colors text-[14px] font-bold"
                >
                  返回
                </button>
              </div>

              <div className="flex flex-col w-full flex-1 overflow-y-auto pr-1 custom-scrollbar right-scrollbar">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-[14px]">加载中...</div>
                ) : expandedView === 'sortie' ? (
                  <>
                    <div className="bg-[#F0F4FA] rounded-xl px-3 py-2 flex items-center text-[14px] font-bold text-[#5B6575] mb-2">
                      <div className="w-10 text-center shrink-0">序号</div>
                      <div className="flex-1 px-2 text-center">飞机架次 / 飞行方案</div>
                      <div className="w-14 text-center shrink-0">显隐</div>
                    </div>
                    {sorties.map((s, index) => (
                      <div 
                        key={s.id} 
                        className={`flex items-center bg-white uav-inset rounded-xl p-2 cursor-pointer border-2 transition-all mb-2 shrink-0 ${currentSortie?.id === s.id ? 'border-[#2F63F6] bg-[#F5F8FF] shadow-[0_4px_12px_rgba(47,99,246,0.1)]' : 'border-transparent hover:border-gray-200'}`}
                        onClick={() => {
                          setCurrentSortie?.(s);
                          setExpandedView('none');
                          setActiveSortieTab('current');
                        }}
                      >
                        <div className="w-8 h-8 bg-[#F0F4FA] rounded-lg flex items-center justify-center text-[14px] font-bold text-[#5B6575] shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 px-3 flex flex-col min-w-0">
                          <span className="text-[14px] font-bold text-[#1F2937] truncate leading-tight">{s.code}</span>
                          <span className="text-[12px] font-bold text-[#9CA3AF] truncate mt-0.5">{s.planName}</span>
                        </div>
                        <div className="w-14 flex justify-center shrink-0" onClick={(e) => e.stopPropagation()}>
                          <Switch 
                            checked={sortieVisibility?.[s.id] ?? false} 
                            onChange={(checked) => setSortieVisibility?.(prev => ({ ...prev, [s.id]: checked }))} 
                            className="scale-110"
                          />
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {plans.map(p => (
                      <div 
                        key={p.id} 
                        className={`flex items-center bg-[#F0F4FA] uav-inset rounded-xl p-3 cursor-pointer border-2 transition-all mb-2 shrink-0 ${currentPlan?.id === p.id ? 'border-[#2F63F6] shadow-[0_2px_8px_rgba(47,99,246,0.15)]' : 'border-transparent hover:border-gray-300'}`}
                        onClick={() => {
                          setCurrentPlan(p);
                          setExpandedView('none');
                          setActiveSortieTab('plan');
                        }}
                      >
                        <div className="flex-1 flex flex-col min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[14px] font-bold text-[#1F2937] truncate pr-2">{p.name}</span>
                            <span className={`text-[12px] font-bold px-2 py-0.5 rounded-md shrink-0 ${p.status === '当前生效' ? 'bg-[#E6F4EA] text-[#15803D]' : 'bg-gray-200 text-gray-600'}`}>
                              {p.version}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* 当前空域 */}
            <section 
              className="workspace-card uav-glass flex flex-col items-center flex-1 min-h-0 relative" 
              style={{ 
                overflow: 'visible',
                zIndex: isAirspaceSettingsOpen ? 100 : 1
              }}
            >
              <div className="panel-inner w-full flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <div className="flex items-center gap-2 text-[#1F2937]">
                    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-none stroke-current stroke-2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <span className="text-[16px] font-bold">当前空域</span>
                    {activeAirspaces.length > 0 && (
                      <span className="bg-[#2F63F6] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {activeAirspaces.length}
                      </span>
                    )}
                  </div>
                  <div className="relative" ref={airspaceSettingsRef}>
                    <button 
                      onClick={() => setIsAirspaceSettingsOpen(!isAirspaceSettingsOpen)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Settings size={16} />
                    </button>
                    {isAirspaceSettingsOpen && (
                      <div className="absolute left-0 top-full mt-2 w-[320px] uav-glass rounded-2xl p-5 z-[1002] max-h-[600px] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex flex-col">
                            <div className="text-[15px] font-bold text-[#1A2238]">生效空域设置</div>
                          </div>
                          <button 
                            onClick={() => setIsAirspaceSettingsOpen(false)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        <div className="space-y-3.5">
                          {allAvailableAirspaces.map(a => (
                            <div 
                              key={a.id} 
                              className={`flex flex-col gap-2.5 p-3.5 rounded-2xl border transition-all cursor-pointer ${selectedAirspaceIds.includes(a.id) ? 'bg-[#F5F8FF] border-[#2F63F6]/20 shadow-sm' : 'bg-[#F9FAFB] border-gray-100 hover:border-gray-200'}`}
                              onClick={() => handleAirspaceToggle(a.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div 
                                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${selectedAirspaceIds.includes(a.id) ? 'bg-[#2F63F6] border-[#2F63F6]' : 'bg-white border-gray-300'}`}
                                  >
                                    {selectedAirspaceIds.includes(a.id) && <Check size={14} className="text-white" strokeWidth={3} />}
                                  </div>
                                  <span className={`text-[14px] font-bold ${selectedAirspaceIds.includes(a.id) ? 'text-[#2F63F6]' : 'text-[#1F2937]'}`}>{a.name}</span>
                                </div>
                                {selectedAirspaceIds.includes(a.id) && (
                                  <span className="text-[10px] font-bold text-[#2F63F6] bg-[#2F63F6]/10 px-2 py-0.5 rounded-full">已选中</span>
                                )}
                              </div>
                              {selectedAirspaceIds.includes(a.id) && (
                                <div 
                                  className="flex items-center gap-2.5 bg-white/60 rounded-xl p-2 border border-[#2F63F6]/5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="text-[11px] font-bold text-[#5B6575] shrink-0">生效时段:</span>
                                  <div className="flex items-center gap-1.5 flex-1">
                                    <CustomTimePicker 
                                      value={(airspaceTimeRanges[a.id] || a.timeRange).split(" - ")[0]}
                                      onChange={(newStart) => handleStartTimeChange(a.id, newStart)}
                                    />
                                    <span className="text-gray-300 text-[10px]">-</span>
                                    <CustomTimePicker 
                                      value={(airspaceTimeRanges[a.id] || a.timeRange).split(" - ")[1]}
                                      onChange={(newEnd) => handleEndTimeChange(a.id, newEnd)}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 w-full flex-1 overflow-y-auto pr-1 custom-scrollbar right-scrollbar" style={{ minHeight: 0 }}>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">加载中...</div>
                  ) : activeAirspaces.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-8">
                      <div className="w-16 h-16 bg-[#F0F4FA] rounded-full flex items-center justify-center mb-4 shadow-inner">
                        <Settings size={32} className="text-[#2F63F6] opacity-40 animate-pulse" />
                      </div>
                      <h3 className="text-[15px] font-bold text-[#1A2238] mb-5">暂无生效空域</h3>
                      <button 
                        onClick={() => setIsAirspaceSettingsOpen(true)}
                        className="px-6 py-2 bg-[#2F63F6] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(47,99,246,0.2)] hover:bg-[#2757DF] transition-all active:scale-95"
                      >
                        立即配置
                      </button>
                    </div>
                  ) : (
                    activeAirspaces.map(a => (
                      <div 
                        key={a.id} 
                        className={`flex items-center justify-between uav-inset rounded-lg px-2.5 py-2 transition-colors ${selectedAirspaceId === a.id ? 'bg-[#E6F4EA] border border-[#15803D]/30' : 'bg-[#F0F4FA]'}`}
                        onClick={() => setSelectedAirspaceId(a.id)}
                      >
                        <span className={`text-[14px] font-bold ${selectedAirspaceId === a.id ? 'text-[#15803D]' : 'text-[#1F2937]'}`}>{a.name}</span>
                        <span className={`text-[12px] font-medium bg-white shadow-sm rounded-md px-2 py-0.5 ${selectedAirspaceId === a.id ? 'text-[#15803D]' : 'text-[#1F2937]'}`}>{a.timeRange}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* 当前架次 / 当前方案 */}
            <section 
              className="workspace-card uav-glass sortie-switch-card flex-1 min-h-0 overflow-hidden relative" 
              style={{ zIndex: 1 }}
            >
              <div className="panel-inner w-full flex flex-col h-full">
                <div className="sortie-segmented shrink-0">
                  <button 
                    className={`sortie-segment-btn ${activeSortieTab === 'current' ? 'active' : ''}`}
                    onClick={() => setActiveSortieTab('current')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Plane className="w-3.5 h-3.5" />
                      当前架次
                    </div>
                  </button>
                  <button 
                    className={`sortie-segment-btn ${activeSortieTab === 'plan' ? 'active' : ''}`}
                    onClick={() => setActiveSortieTab('plan')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Route className="w-3.5 h-3.5" />
                      当前方案
                    </div>
                  </button>
                </div>

                {activeSortieTab === 'current' && (
                  <div className="sortie-panel active flex flex-col items-center flex-1 w-full mt-3 min-h-0">
                    <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
                      <div className="text-center text-[#2F63F6] text-[20px] font-bold leading-[1.3] break-all px-2 line-clamp-2">
                        {isLoading ? '加载中...' : currentSortie?.code}
                      </div>
                    </div>
                    <div className="w-full shrink-0 mt-3 flex gap-2">
                      <Button variant="outline" className="flex-1">
                        详情
                      </Button>
                      <Button 
                        onClick={() => setExpandedView('sortie')}
                        className="flex-1"
                      >
                        切换
                      </Button>
                    </div>
                  </div>
                )}

                {activeSortieTab === 'plan' && (
                  <div className="sortie-panel active flex flex-col items-center flex-1 w-full mt-3 min-h-0">
                    <div className="flex-1 flex flex-col items-center justify-center w-full gap-2 overflow-hidden">
                      <div className="text-center text-[#2F63F6] text-[20px] font-bold leading-[1.3] break-all px-2 line-clamp-2" title={currentPlan?.name}>
                        {isLoading ? '加载中...' : currentPlan?.name}
                      </div>
                      <div className="bg-[#E6F4EA] text-[#15803D] text-[11px] font-bold px-3 py-1 rounded-full shrink-0">
                        {isLoading ? '...' : `${currentPlan?.version} - 修改于：${currentPlan?.updateTime}`}
                      </div>
                    </div>
                    <div className="w-full shrink-0 mt-3 flex gap-2">
                      <Button variant="outline" className="flex-1">
                        详情
                      </Button>
                      <Button 
                        onClick={() => setExpandedView('plan')}
                        className="flex-1"
                      >
                        切换
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {/* 悬浮面板控制按钮长条容器 */}
      {panelStates && setPanelStates && (
        <div className="workspace-card uav-glass shrink-0 flex items-center justify-between gap-3 p-3">
          <Button 
            variant={panelStates.flightParams ? 'secondary' : 'outline'}
            className="flex-1 rounded-full"
            onClick={() => setPanelStates({...panelStates, flightParams: !panelStates.flightParams})}
          >
            飞行参数
          </Button>
          <Button 
            variant={panelStates.opCondition ? 'secondary' : 'outline'}
            className="flex-1 rounded-full"
            onClick={() => setPanelStates({...panelStates, opCondition: !panelStates.opCondition})}
          >
            作业条件
          </Button>
          <Button 
            variant={panelStates.uavVideo ? 'secondary' : 'outline'}
            className="flex-1 rounded-full"
            onClick={() => setPanelStates({...panelStates, uavVideo: !panelStates.uavVideo})}
          >
            无人机视频
          </Button>
        </div>
      )}

      {/* 工作记录 */}
      <section className="workspace-card uav-glass record-card">
        <div className="tabs">
          <button 
            className={`tab ${activeRecordTab === 'record' ? 'active' : ''}`}
            onClick={() => setActiveRecordTab('record')}
          >
            工作记录
          </button>
          <button 
            className={`tab ${activeRecordTab === 'route' ? 'active' : ''}`}
            onClick={() => setActiveRecordTab('route')}
          >
            预飞航线
          </button>
          <button 
            className={`tab ${activeRecordTab === 'layer' ? 'active' : ''}`}
            onClick={() => setActiveRecordTab('layer')}
          >
            战术图层
          </button>
        </div>

        {activeRecordTab === 'record' && (
          <div className="tab-panel active">
            <div className="tab-panel-bg"></div>
            <div className="tab-panel-scroll custom-scrollbar" ref={timelineBoxRef}>
              <div className="tab-panel-content">
                <div className="timeline-box">
                  <ol className="timeline">
                    <li className="timeline-item info">
                      <span className="timeline-dot"></span>
                      <div className="timeline-meta text-timeline">12:32 · 下发</div>
                      <h3 className="timeline-title">下发预飞航线</h3>
                      <div className="timeline-desc text-body">
                        V2 标准巡检路线 已下发至 {currentSortie?.code || '未知架次'}。
                      </div>
                    </li>

                    <li className="timeline-item info">
                      <span className="timeline-dot"></span>
                      <div className="timeline-meta text-timeline">12:56 · 换绑</div>
                      <h3 className="timeline-title">换绑飞行方案</h3>
                      <div className="timeline-desc text-body">
                        当前预飞航线已换绑至 {currentPlan?.name || '未知方案'}。
                      </div>
                    </li>

                    <li className="timeline-item info">
                      <span className="timeline-dot"></span>
                      <div className="timeline-meta text-timeline">13:10 · 新增版本</div>
                      <h3 className="timeline-title">新增预飞航线版本</h3>
                      <div className="timeline-desc text-body">
                        V4 应急绕飞航线 已生成，待确认是否设为当前版本。
                      </div>
                    </li>

                    <li className="timeline-item success">
                      <span className="timeline-dot"></span>
                      <div className="timeline-meta text-timeline">13:37 · 下发</div>
                      <h3 className="timeline-title">下发潜力区</h3>
                      <div className="timeline-desc text-body">
                        潜力区-增雨作业区A 已下发至当前架次作业终端。
                      </div>
                    </li>

                    <li className="timeline-item success">
                      <span className="timeline-dot"></span>
                      <div className="timeline-meta text-timeline">13:52 · 新增</div>
                      <h3 className="timeline-title">新增潜力区</h3>
                      <div className="timeline-desc text-body">
                        手动潜力区-01 已创建并关联本次增雨作业任务。
                      </div>
                    </li>

                    <li className="timeline-item warning">
                      <span className="timeline-dot"></span>
                      <div className="timeline-meta text-timeline">14:08 · 编辑</div>
                      <h3 className="timeline-title">编辑危险区</h3>
                      <div className="timeline-desc text-body">
                        预警产品-危险区 已更新边界范围与生效时段。
                      </div>
                    </li>

                    <li className="timeline-item warning">
                      <span className="timeline-dot"></span>
                      <div className="timeline-meta text-timeline">14:22 · 下发</div>
                      <h3 className="timeline-title">下发危险区</h3>
                      <div className="timeline-desc text-body">
                        手动危险区-01 已下发至当前架次 UAS06399445_20260408_01。
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeRecordTab === 'route' && (
          <div className="tab-panel active scrollable custom-scrollbar no-inset">
            <div className="route-panel">
              <div className="route-toolbar">
                <div className="route-toolbar-left">
                  <span>当前版本：</span>
                  <span className="route-version-pill">
                    {activeRoute} {routeVersions.find(v => v.id === activeRoute)?.name}
                  </span>
                </div>
                <div className="route-toolbar-actions">
                  <button 
                    className={`route-visibility-btn ${!isRouteVisible ? 'is-hidden' : ''}`}
                    onClick={() => setIsRouteVisible?.(!isRouteVisible)}
                    title={isRouteVisible ? '隐藏预飞航线' : '显示预飞航线'}
                  >
                    {isRouteVisible ? (
                      <svg className="icon-eye-on" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M1.5 12s3.8-6 10.5-6 10.5 6 10.5 6-3.8 6-10.5 6S1.5 12 1.5 12Z"></path>
                        <circle cx="12" cy="12" r="3.2"></circle>
                      </svg>
                    ) : (
                      <svg className="icon-eye-off" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 3l18 18"></path>
                        <path d="M10.6 10.7a2.8 2.8 0 0 0 3.9 3.9"></path>
                        <path d="M9.9 5.2A11.9 11.9 0 0 1 12 5c6.7 0 10.5 7 10.5 7a18.2 18.2 0 0 1-3.5 4.2"></path>
                        <path d="M6.2 6.2A18.4 18.4 0 0 0 1.5 12s3.8 7 10.5 7c1.8 0 3.5-.5 5-1.3"></path>
                      </svg>
                    )}
                  </button>
                  <button className="route-create-btn" aria-label="创建新版本">+</button>
                </div>
              </div>

              <div className="route-list" style={{ opacity: isRouteVisible ? 1 : 0.55 }}>
                {routeVersions.map(v => (
                  <DraggableAttachmentItem
                    key={v.id}
                    item={{
                      objectId: v.id,
                      objectType: AttachmentObjectType.PREFLIGHT_ROUTE_VERSION,
                      objectName: v.name,
                      objectDisplayName: `${currentPlan?.name || '青海外场试飞计划方案'} ${v.id} ${v.name}`,
                      previewThumbnailUrl: `https://picsum.photos/seed/route${v.id}/40/40`,
                      draggable: true,
                      isDeleted: false,
                      isDraft: false,
                      hasPermission: true,
                      versionId: v.id,
                      versionNo: v.id,
                      versionName: v.name,
                      flightPlanId: currentPlan?.id,
                      flightPlanName: currentPlan?.name,
                      sortieId: currentSortie?.id,
                      sortieName: currentSortie?.code,
                    }}
                    className={`route-item ${activeRoute === v.id ? 'active' : ''}`}
                  >
                    <div className="route-main">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                          <img draggable={false} src={`https://picsum.photos/seed/route${v.id}/40/40`} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="route-title-row mb-1">
                            <span className="route-version">{v.id}</span>
                            <span className="route-name">{v.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="route-time">修改于 {v.time}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Radio checked={activeRoute === v.id} onChange={() => setActiveRoute?.(v.id)} className="shrink-0" />
                    <MoreMenu />
                  </DraggableAttachmentItem>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeRecordTab === 'layer' && (
          <div className="tab-panel active scrollable custom-scrollbar no-inset">
            <div className="layer-panel">
              <div className="layer-section danger">
                <div className="layer-section-head">
                  <div className="layer-title-wrap">
                    <span className="layer-accent"></span>
                    <span className="layer-title">危险区</span>
                  </div>
                  <button className="layer-add-btn" aria-label="新增">+</button>
                </div>

                <div className="layer-list">
                  <DraggableAttachmentItem
                    item={{
                      objectId: 'danger-1',
                      objectType: AttachmentObjectType.DANGER_ZONE,
                      objectName: '预警产品-强对流危险区',
                      objectDisplayName: '预警产品-强对流危险区',
                      previewThumbnailUrl: 'https://picsum.photos/seed/danger1/40/40',
                      draggable: true,
                      isDeleted: false,
                      isDraft: false,
                      hasPermission: true,
                      sortieId: currentSortie?.id,
                      sortieName: currentSortie?.code,
                    }}
                    className="layer-item"
                  >
                    <div className="layer-item-main flex-1">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                          <img draggable={false} src="https://picsum.photos/seed/danger1/40/40" alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1 justify-center">
                          <div className="flex items-center gap-2">
                            <span className="layer-index">01.</span>
                            <span className="layer-name">预警产品-强对流危险区</span>
                            <span className="layer-badge shrink-0">系统生成</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Switch checked={activeLayers.danger1} onChange={() => setActiveLayers(prev => ({...prev, danger1: !prev.danger1}))} className="shrink-0" />
                    <MoreMenu />
                  </DraggableAttachmentItem>

                  <DraggableAttachmentItem
                    item={{
                      objectId: 'danger-2',
                      objectType: AttachmentObjectType.DANGER_ZONE,
                      objectName: '预警产品-闪电预警区',
                      objectDisplayName: '预警产品-闪电预警区',
                      previewThumbnailUrl: 'https://picsum.photos/seed/danger2/40/40',
                      draggable: true,
                      isDeleted: false,
                      isDraft: false,
                      hasPermission: true,
                      sortieId: currentSortie?.id,
                      sortieName: currentSortie?.code,
                    }}
                    className="layer-item"
                  >
                    <div className="layer-item-main flex-1">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                          <img draggable={false} src="https://picsum.photos/seed/danger2/40/40" alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1 justify-center">
                          <div className="flex items-center gap-2">
                            <span className="layer-index">02.</span>
                            <span className="layer-name">预警产品-闪电预警区</span>
                            <span className="layer-badge shrink-0">系统生成</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Switch checked={activeLayers.danger2} onChange={() => setActiveLayers(prev => ({...prev, danger2: !prev.danger2}))} className="shrink-0" />
                    <MoreMenu />
                  </DraggableAttachmentItem>
                </div>
              </div>

              <div className="layer-section potential">
                <div className="layer-section-head">
                  <div className="layer-title-wrap">
                    <span className="layer-accent"></span>
                    <span className="layer-title">潜力区</span>
                  </div>
                  <button className="layer-add-btn" aria-label="新增">+</button>
                </div>

                <div className="layer-list">
                  <DraggableAttachmentItem
                    item={{
                      objectId: 'potential-1',
                      objectType: AttachmentObjectType.POTENTIAL_ZONE,
                      objectName: '数值模式-潜力区',
                      objectDisplayName: '数值模式-潜力区',
                      previewThumbnailUrl: 'https://picsum.photos/seed/potential1/40/40',
                      draggable: true,
                      isDeleted: false,
                      isDraft: false,
                      hasPermission: true,
                      sortieId: currentSortie?.id,
                      sortieName: currentSortie?.code,
                    }}
                    className="layer-item"
                  >
                    <div className="layer-item-main flex-1">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                          <img draggable={false} src="https://picsum.photos/seed/potential1/40/40" alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1 justify-center">
                          <div className="flex items-center gap-2">
                            <span className="layer-index">01.</span>
                            <span className="layer-name">数值模式-潜力区</span>
                            <span className="layer-badge shrink-0">系统生成</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Switch checked={activeLayers.potential1} onChange={() => setActiveLayers(prev => ({...prev, potential1: !prev.potential1}))} className="shrink-0" />
                    <MoreMenu />
                  </DraggableAttachmentItem>
                </div>
              </div>

              <div className="layer-section airspace mt-4">
                <div className="layer-section-head">
                  <div className="layer-title-wrap">
                    <span className="layer-accent bg-[#2F63F6]"></span>
                    <span className="layer-title">空域图层</span>
                  </div>
                  <button className="layer-add-btn" aria-label="新增">+</button>
                </div>

                <div className="layer-list">
                  <DraggableAttachmentItem
                    item={{
                      objectId: 'airspace-qinghai',
                      objectType: AttachmentObjectType.AIRSPACE,
                      objectName: '青海地区空域网格',
                      objectDisplayName: '青海地区空域网格',
                      previewThumbnailUrl: 'https://picsum.photos/seed/airspace/40/40',
                      draggable: true,
                      isDeleted: false,
                      isDraft: false,
                      hasPermission: true,
                    }}
                    className="layer-item"
                  >
                    <div className="layer-item-main flex-1">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 bg-[#F0F4FA] rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#2F63F6] fill-none stroke-current stroke-2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1 justify-center">
                          <div className="flex items-center gap-2">
                            <span className="layer-index">01.</span>
                            <span className="layer-name">青海地区空域网格</span>
                            <span className="layer-badge shrink-0 bg-blue-50 text-blue-600 border-blue-100">演示数据</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Switch checked={activeAirspaceLayer} onChange={() => setActiveAirspaceLayer(!activeAirspaceLayer)} className="shrink-0" />
                    <MoreMenu />
                  </DraggableAttachmentItem>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </aside>
  );
}
