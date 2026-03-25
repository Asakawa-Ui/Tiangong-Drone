import React, { useState, useRef, useEffect } from 'react';
import { Plane, Route, MoreVertical } from 'lucide-react';
import './WorkspaceLeft.css';
import { Radio, Switch } from './ui/SelectionControls';
import { api, Airspace, Sortie, Plan } from '../services/api';

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
    <div className="more-wrap relative" ref={menuRef}>
      <button 
        className="more-btn" 
        aria-label="更多"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreVertical size={18} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-24 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 p-1.5 z-50 flex flex-col gap-1">
          <button className="px-3 py-2 text-[13px] text-[#4b5563] hover:bg-gray-50 rounded-xl text-center font-bold transition-colors">编辑</button>
          <button className="px-3 py-2 text-[13px] text-[#e14d39] hover:bg-red-50 rounded-xl text-center font-bold transition-colors">删除</button>
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
}

export default function WorkspaceLeft({ panelStates, setPanelStates }: WorkspaceLeftProps) {
  const [activeSortieTab, setActiveSortieTab] = useState('current'); // 'current' | 'plan'
  const [activeRecordTab, setActiveRecordTab] = useState('record'); // 'record' | 'route' | 'layer'
  const [isRouteVisible, setIsRouteVisible] = useState(true);
  const [activeRoute, setActiveRoute] = useState('V2');
  const [activeLayers, setActiveLayers] = useState({
    danger1: true,
    danger2: false,
    potential1: true
  });

  const [airspaces, setAirspaces] = useState<Airspace[]>([]);
  const [currentSortie, setCurrentSortie] = useState<Sortie | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [airspacesData, sortieData, planData] = await Promise.all([
          api.getAirspaces(),
          api.getCurrentSortie(),
          api.getCurrentPlan()
        ]);
        setAirspaces(airspacesData);
        setCurrentSortie(sortieData);
        setCurrentPlan(planData);
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
      <div className="left-top h-[260px] flex gap-4">
        {/* 当前空域 */}
        <section className="workspace-card uav-glass flex flex-col items-center flex-1 min-h-0 overflow-hidden">
          <div className="panel-inner w-full flex flex-col h-full">
            <div className="flex items-center justify-center gap-2 mb-4 text-[#2F63F6] shrink-0">
              <svg viewBox="0 0 1024 1024" className="w-[18px] h-[18px] fill-current">
                <path d="M245.686294 146.336899q-0.102369-4.708987-0.6654-9.36679-0.563031-4.708987-1.53554-9.315605-1.023693-4.606618-2.508047-9.059682-1.43317-4.504249-3.327002-8.803759-1.842647-4.350695-4.094772-8.445467-2.303309-4.094772-5.016095-8.035989-2.661602-3.890033-5.681495-7.472958-3.071079-3.582925-6.398081-6.909927-3.378187-3.275817-7.063481-6.244527-3.63411-2.968709-7.575327-5.527941-3.941218-2.559232-8.138359-4.811357-4.145956-2.149755-8.496651-3.941218-4.401879-1.791463-8.906128-3.122263-4.504249-1.381985-9.110867-2.252124-4.606618-0.921324-9.315605-1.381986Q153.144457 51.184645 148.435469 51.184645q-4.760172 0-9.520344 0.511846-4.760172 0.409477-9.469159 1.381985-4.657803 0.921324-9.213236 2.303309-4.606618 1.381985-9.008497 3.224633-4.401879 1.791463-8.650205 4.094772-4.197141 2.20094-8.189543 4.862541-3.941218 2.661602-7.677697 5.681495-3.685294 3.071079-7.063481 6.398081-3.378187 3.378187-6.398081 7.114666-3.019894 3.685294-5.63031 7.677696-2.712786 3.941218-4.964911 8.189543-2.252124 4.197141-4.094772 8.599021-1.791463 4.401879-3.173448 8.957313-1.381985 4.606618-2.303309 9.26442-0.972508 4.708987-1.43317 9.469159Q51.184645 143.675297 51.184645 148.435469q0 4.453064 0.409477 8.854944t1.228431 8.803759q0.76777 4.350695 1.996201 8.650205 1.177247 4.248326 2.763971 8.394281t3.582925 8.138359q1.945016 3.992402 4.248326 7.780066 2.303309 3.787664 4.913726 7.370589 2.661602 3.582925 5.630311 6.858742 2.968709 3.327002 6.193342 6.346896 3.275817 3.019894 6.756373 5.73268 3.53174 2.712786 7.268219 5.118465 3.736479 2.354494 7.677697 4.401879 3.992402 2.047386 8.087174 3.685295 4.094772 1.689093 8.343097 2.968709t8.59902 2.149755q4.350695 0.921324 8.803759 1.381985l98.888733 593.43477q-6.244527 2.917525-11.977206 6.705188-5.73268 3.787664-10.90233 8.343097-5.118464 4.555433-9.622713 9.776268-4.453064 5.220834-8.138358 11.055883-3.685294 5.835049-6.50045 12.079576-2.815155 6.295711-4.760172 12.89853-1.893832 6.551635-2.86634 13.410377-0.972508 6.807558-0.972509 13.6663 0 4.760172 0.511847 9.520344 0.409477 4.760172 1.381985 9.46916 0.921324 4.657803 2.303309 9.213236 1.381985 4.606618 3.224633 9.008497 1.842647 4.401879 4.094771 8.650205 2.252124 4.197141 4.862542 8.189543 2.661602 3.941218 5.681495 7.677697 3.071079 3.685294 6.449265 7.012296 3.378187 3.378187 7.063481 6.449265 3.685294 3.019894 7.677697 5.630311 3.941218 2.712786 8.189543 4.964911 4.197141 2.252124 8.599021 4.094771 4.401879 1.791463 9.008497 3.173448 4.555433 1.381985 9.213236 2.303309 4.708987 0.972508 9.469159 1.43317 4.760172 0.460662 9.520344 0.460662 4.504249 0 8.957313-0.409477 4.504249-0.409477 8.906128-1.228431t8.70139-2.047386q4.350695-1.228431 8.496651-2.86634 4.197141-1.637909 8.189543-3.582925 4.094772-2.047386 7.882435-4.40188 3.787664-2.354494 7.370589-5.016095 3.582925-2.712786 6.909927-5.73268 3.327002-3.071079 6.346896-6.346896 3.071079-3.327002 5.73268-6.909927 2.712786-3.582925 5.118465-7.370589 2.354494-3.787664 4.350694-7.831251 2.047386-3.992402 3.63411-8.189543 1.637909-4.145956 2.86634-8.496651 1.279616-4.29951 2.047386-8.701389 0.870139-4.401879 1.330801-8.906129 194.757573-34.805558 213.695891-34.805558a30.710787 30.710787 0 1 0 0-61.421573q-23.852044 0-227.515745 36.341097-5.220834-8.547836-12.079576-15.86724-6.858742-7.26822-15.048286-13.052084-8.189543-5.73268-17.402779-9.725082-9.162051-3.941218-18.938319-5.937419L197.777467 232.224733q17.709887-10.441667 29.687094-27.127862l604.490652 161.180446q2.252124 8.854944 6.039788 17.146856 3.787664 8.291912 9.059683 15.76487 5.272018 7.421773 11.874837 13.76867 6.551635 6.346896 14.178147 11.311806l-32.809357 131.339798a30.710787 30.710787 0 1 0 59.578926 14.843547l32.604618-130.469659q4.606618-0.255923 9.110867-1.023693 4.555433-0.6654 8.957313-1.842647 4.453064-1.126062 8.803759-2.661602 4.29951-1.535539 8.445466-3.53174 4.145956-1.945016 8.087174-4.248326 3.941218-2.354494 7.677697-5.067279 3.685294-2.661602 7.16585-5.732681 3.429371-3.019894 6.551635-6.346896 3.173448-3.327002 5.937418-6.961111 2.815155-3.63411 5.272019-7.524143 2.456863-3.838848 4.606618-7.93362 2.047386-4.094772 3.736479-8.343097 1.689093-4.29951 2.968709-8.701389 1.279616-4.401879 2.098571-8.906129 0.870139-4.504249 1.3308-9.059682Q1023.692892 347.492552 1023.692892 342.937119q0-4.760172-0.460662-9.520344-0.511846-4.760172-1.381985-9.469159-0.921324-4.657803-2.354494-9.213236-1.381985-4.606618-3.173448-9.008498-1.842647-4.401879-4.094771-8.650205-2.252124-4.197141-4.913726-8.189543-2.661602-3.941218-5.681496-7.677697-3.071079-3.63411-6.39808-7.012296-3.378187-3.378187-7.114666-6.449265-3.685294-3.019894-7.677697-5.630311-3.941218-2.712786-8.189543-4.96491-4.197141-2.252124-8.59902-4.094772-4.401879-1.791463-8.957313-3.173448-4.606618-1.381985-9.26442-2.303309-4.708987-0.972508-9.46916-1.43317-4.760172-0.460662-9.520344-0.460662-7.063481 0-14.024592 1.023693-7.012296 1.023693-13.819854 3.071079-6.705188 1.996201-13.154454 4.96491-6.398081 2.968709-12.284315 6.858743-5.937419 3.838848-11.209437 8.547835-5.272018 4.657803-9.827452 10.083375-4.555433 5.374388-8.291912 11.414176-3.736479 5.988603-6.551635 12.437869L245.686294 146.388084z m551.105069 488.301509a162.101769 162.101769 0 1 1 0 324.203539 162.101769 162.101769 0 0 1 0-324.152354z m64.390283 86.757973l-2.405679 2.456863-88.754174 88.702989-35.26622-34.805558-2.405678-2.456863a27.127862 27.127862 0 0 0-35.675697 2.405678 26.718384 26.718384 0 0 0 0 35.675697v2.456863l53.897431 53.897431 2.86634 2.405678c9.571529 7.677697 23.186644 7.677697 32.758172 0l2.86634-2.405678 107.794862-107.794861 2.456863-2.456863a27.127862 27.127862 0 0 0-2.456863-35.624513 26.718384 26.718384 0 0 0-35.675697-2.456863z"/>
              </svg>
              <span className="text-[16px] font-bold text-[#1F2937]">当前空域</span>
            </div>

            <div className="flex flex-col gap-2.5 w-full flex-1 overflow-y-auto pr-1 custom-scrollbar" style={{ minHeight: 0 }}>
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">加载中...</div>
              ) : (
                airspaces.map(a => (
                  <div key={a.id} className="flex items-center justify-between bg-[#F0F4FA] uav-inset rounded-lg px-2.5 py-2">
                    <span className="text-[14px] font-bold text-[#1F2937]">{a.name}</span>
                    <span className="text-[12px] font-medium text-[#1F2937] bg-white shadow-sm rounded-md px-2 py-0.5">{a.timeRange}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* 当前架次 / 当前方案 */}
        <section className="workspace-card uav-glass sortie-switch-card flex-1 min-h-0 overflow-hidden">
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
                  <button className="flex-1 bg-[#F0F4FA] uav-inset hover:bg-[#E4E9F2] text-[#1F2937] rounded-xl py-2.5 text-[14px] font-bold transition-colors">
                    详情
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-[#608BFF] to-[#2F63F6] hover:from-[#4B7CFF] hover:to-[#2757DF] text-white rounded-xl py-2.5 text-[14px] font-bold transition-all shadow-[0_4px_12px_rgba(47,99,246,0.25)]">
                    切换
                  </button>
                </div>
              </div>
            )}

            {activeSortieTab === 'plan' && (
              <div className="sortie-panel active flex flex-col items-center flex-1 w-full mt-3 min-h-0">
                <div className="flex-1 flex flex-col items-center justify-center w-full gap-2 overflow-hidden">
                  <div className="text-center text-[#2F63F6] text-[20px] font-bold leading-[1.3] break-all px-2 line-clamp-2" title={currentPlan?.name}>
                    {isLoading ? '加载中...' : currentPlan?.name}
                  </div>
                  <div className="bg-[#E6F4EA] text-[#137333] text-[11px] font-bold px-3 py-1 rounded-full shrink-0">
                    {isLoading ? '...' : `${currentPlan?.version} - 修改于：${currentPlan?.updateTime}`}
                  </div>
                </div>
                <div className="w-full shrink-0 mt-3 flex gap-2">
                  <button className="flex-1 bg-[#F0F4FA] uav-inset hover:bg-[#E4E9F2] text-[#1F2937] rounded-xl py-2.5 text-[14px] font-bold transition-colors">
                    详情
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-[#608BFF] to-[#2F63F6] hover:from-[#4B7CFF] hover:to-[#2757DF] text-white rounded-xl py-2.5 text-[14px] font-bold transition-all shadow-[0_4px_12px_rgba(47,99,246,0.25)]">
                    切换
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 悬浮面板控制按钮长条容器 */}
      {panelStates && setPanelStates && (
        <div className="workspace-card uav-glass shrink-0 flex items-center justify-between gap-3 p-3">
          <button 
            className={`flex-1 py-2.5 rounded-full text-[15px] font-bold transition-all ${panelStates.flightParams ? 'bg-gradient-to-br from-[#B055A4] to-[#C875BD] text-white shadow-[0_4px_12px_rgba(176,85,164,0.25)] hover:from-[#9d4b92] hover:to-[#b55da9]' : 'bg-[#F0F4FA] uav-inset text-[#5B6575] hover:bg-[#E4E9F2] hover:text-[#B055A4]'}`}
            onClick={() => setPanelStates({...panelStates, flightParams: !panelStates.flightParams})}
          >
            飞行参数
          </button>
          <button 
            className={`flex-1 py-2.5 rounded-full text-[15px] font-bold transition-all ${panelStates.opCondition ? 'bg-gradient-to-br from-[#B055A4] to-[#C875BD] text-white shadow-[0_4px_12px_rgba(176,85,164,0.25)] hover:from-[#9d4b92] hover:to-[#b55da9]' : 'bg-[#F0F4FA] uav-inset text-[#5B6575] hover:bg-[#E4E9F2] hover:text-[#B055A4]'}`}
            onClick={() => setPanelStates({...panelStates, opCondition: !panelStates.opCondition})}
          >
            作业条件
          </button>
          <button 
            className={`flex-1 py-2.5 rounded-full text-[15px] font-bold transition-all ${panelStates.uavVideo ? 'bg-gradient-to-br from-[#B055A4] to-[#C875BD] text-white shadow-[0_4px_12px_rgba(176,85,164,0.25)] hover:from-[#9d4b92] hover:to-[#b55da9]' : 'bg-[#F0F4FA] uav-inset text-[#5B6575] hover:bg-[#E4E9F2] hover:text-[#B055A4]'}`}
            onClick={() => setPanelStates({...panelStates, uavVideo: !panelStates.uavVideo})}
          >
            无人机视频
          </button>
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
            <div className="timeline-box bg-[#F0F4FA] uav-inset">
              <ol className="timeline">
                <li className="timeline-item danger">
                  <span className="timeline-dot"></span>
                  <div className="timeline-meta text-timeline">14:22 · Review Required</div>
                  <h3 className="timeline-title">Collision Vector Analysis</h3>
                  <div className="timeline-desc text-body">
                    Operator validation needed for flight path delta at WP-04.
                  </div>
                </li>

                <li className="timeline-item success">
                  <span className="timeline-dot"></span>
                  <div className="timeline-meta text-timeline">13:45 · Completed</div>
                  <h3 className="timeline-title">Labeling Danger Area -01</h3>
                  <div className="timeline-desc text-body">
                    Boundary coordinates synchronized with STRATOS-1 telemetry.
                  </div>
                </li>

                <li className="timeline-item info">
                  <span className="timeline-dot"></span>
                  <div className="timeline-meta text-timeline">12:10 · Dispatched</div>
                  <h3 className="timeline-title">Thermal Scan Deployment</h3>
                  <div className="timeline-desc text-body">
                    Payload activated for sector Alpha-Niner reconnaissance.
                  </div>
                </li>
              </ol>
            </div>
          </div>
        )}

        {activeRecordTab === 'route' && (
          <div className="tab-panel active">
            <div className="route-panel">
              <div className="route-toolbar">
                <div className="route-toolbar-left">
                  <span>当前生效版本：</span>
                  <span className="route-version-pill">V2 标准巡检路线</span>
                  <span className="route-current-name">标准巡检路线</span>
                </div>
                <div className="route-toolbar-actions">
                  <button 
                    className={`route-visibility-btn ${!isRouteVisible ? 'is-hidden' : ''}`}
                    onClick={() => setIsRouteVisible(!isRouteVisible)}
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
                <div className={`route-item ${activeRoute === 'V3' ? 'active' : ''}`} data-kind="route" onClick={() => setActiveRoute('V3')}>
                  <div className="route-main">
                    <div className="route-title-row">
                      <span className="route-version">V3</span>
                      <span className="route-name">应急响应预案</span>
                    </div>
                    <div className="route-time">最后修改于：11:30</div>
                  </div>
                  <Radio checked={activeRoute === 'V3'} onChange={() => setActiveRoute('V3')} className="shrink-0" />
                  <MoreMenu />
                </div>

                <div className={`route-item ${activeRoute === 'V2' ? 'active' : ''}`} data-kind="route" onClick={() => setActiveRoute('V2')}>
                  <div className="route-main">
                    <div className="route-title-row">
                      <span className="route-version">V2</span>
                      <span className="route-name">标准巡检路线</span>
                    </div>
                    <div className="route-time">最后修改于：10:00</div>
                  </div>
                  <Radio checked={activeRoute === 'V2'} onChange={() => setActiveRoute('V2')} className="shrink-0" />
                  <MoreMenu />
                </div>

                <div className={`route-item ${activeRoute === 'V1' ? 'active' : ''}`} data-kind="route" onClick={() => setActiveRoute('V1')}>
                  <div className="route-main">
                    <div className="route-title-row">
                      <span className="route-version">V1</span>
                      <span className="route-name">初始地形扫描</span>
                    </div>
                    <div className="route-time">最后修改于：08:15</div>
                  </div>
                  <Radio checked={activeRoute === 'V1'} onChange={() => setActiveRoute('V1')} className="shrink-0" />
                  <MoreMenu />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeRecordTab === 'layer' && (
          <div className="tab-panel active">
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
                  <div className="layer-item">
                    <div className="layer-item-main">
                      <span className="layer-index">01.</span>
                      <span className="layer-name">预警产品-危险区</span>
                      <span className="layer-badge">系统生成</span>
                    </div>
                    <Switch checked={activeLayers.danger1} onChange={() => setActiveLayers(prev => ({...prev, danger1: !prev.danger1}))} className="shrink-0" />
                    <MoreMenu />
                  </div>

                  <div className="layer-item">
                    <div className="layer-item-main">
                      <span className="layer-index">02.</span>
                      <span className="layer-name">手动危险区-01</span>
                    </div>
                    <Switch checked={activeLayers.danger2} onChange={() => setActiveLayers(prev => ({...prev, danger2: !prev.danger2}))} className="shrink-0" />
                    <MoreMenu />
                  </div>
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
                  <div className="layer-item">
                    <div className="layer-item-main">
                      <span className="layer-index">01.</span>
                      <span className="layer-name">预警产品-潜力区</span>
                      <span className="layer-badge">系统生成</span>
                    </div>
                    <Switch checked={activeLayers.potential1} onChange={() => setActiveLayers(prev => ({...prev, potential1: !prev.potential1}))} className="shrink-0" />
                    <MoreMenu />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </aside>
  );
}
