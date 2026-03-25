import React, { useState } from 'react';
import { MapPin, SatelliteDish, Star, ChevronDown, Check, FileText, Layers } from 'lucide-react';

/**
 * 公共组件-GIS功能快捷组件
 * 提供地图图层控制、操作工具、标绘工具、分析工具等快捷操作面板
 */
export default function GISFunctionShortcuts() {
  const [activeTopButton, setActiveTopButton] = useState('distribution');
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(true);
  const [weatherTab, setWeatherTab] = useState('warning');
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>('SWAN雷达');
  const [activeSubProduct, setActiveSubProduct] = useState<string | null>('反射率临近预报');
  
  const [sections, setSections] = useState({
    map: true,
    operation: true,
    plot: true,
    tool: true
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTopButtonClick = (id: string) => {
    if (activeTopButton === id) {
      setIsPanelExpanded(!isPanelExpanded);
    } else {
      setActiveTopButton(id);
      setIsPanelExpanded(true);
    }
  };

  const getTriangleOffset = (id: string) => {
    switch(id) {
      case 'favorites': return '8px';
      case 'weather': return '48px';
      case 'distribution': return '88px';
      case 'special': return '128px';
      default: return '88px';
    }
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-[11px]">
      {/* Top Buttons */}
      <div className="flex items-center gap-2 pr-[16px] relative">
        <button 
          className={`border border-[#C1D6FF] w-[32px] h-[32px] flex items-center justify-center rounded-[5px] shadow-sm transition-colors ${
            (activeTopButton === 'special' && isPanelExpanded) ? 'bg-white text-[#5185E8]' : 'bg-[#EAF1FF] text-[#5185E8] hover:bg-white'
          }`}
          onClick={() => handleTopButtonClick('special')}
          title="专报指令"
        >
          <FileText size={18} />
        </button>
        
        <button 
          className={`border border-[#C1D6FF] w-[32px] h-[32px] flex items-center justify-center rounded-[5px] shadow-sm transition-colors ${
            (activeTopButton === 'distribution' && isPanelExpanded) ? 'bg-white text-[#5185E8]' : 'bg-[#EAF1FF] text-[#5185E8] hover:bg-white'
          }`}
          onClick={() => handleTopButtonClick('distribution')}
          title="分布"
        >
          <MapPin size={18} />
        </button>
        
        <button 
          className={`border border-[#C1D6FF] w-[32px] h-[32px] flex items-center justify-center rounded-[5px] shadow-sm transition-colors ${
            (activeTopButton === 'weather' && isPanelExpanded) ? 'bg-white text-[#5185E8]' : 'bg-[#EAF1FF] text-[#5185E8] hover:bg-white'
          }`}
          onClick={() => handleTopButtonClick('weather')}
          title="气象产品"
        >
          <SatelliteDish size={18} />
        </button>
        
        <button 
          className={`border border-[#C1D6FF] w-[32px] h-[32px] flex items-center justify-center rounded-[5px] shadow-sm transition-colors ${
            (activeTopButton === 'favorites' && isPanelExpanded) ? 'bg-white text-[#5185E8]' : 'bg-[#EAF1FF] text-[#5185E8] hover:bg-white'
          }`}
          onClick={() => handleTopButtonClick('favorites')}
          title="收藏夹"
        >
          <Star size={18} />
        </button>
      </div>

      <div className="relative w-full flex justify-end">
        {/* Vertical Toolbar */}
        <div 
          className="w-[64px] flex flex-col gap-1 z-20 transition-all duration-300"
          style={{ marginRight: isPanelExpanded ? '368px' : '16px' }}
        >
          <div 
            className="bg-[#5185E8] text-white text-[13px] font-bold py-1.5 px-2 rounded-[5px] flex items-center justify-center cursor-pointer shadow-sm"
            onClick={() => setIsToolbarExpanded(!isToolbarExpanded)}
          >
            工具条
          </div>
          
          <div className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ${isToolbarExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {/* Section: 地图 */}
          <div className="bg-white border border-[#C1D6FF] rounded-[5px] overflow-hidden shadow-sm">
            <div 
              className="bg-[#EAF1FF] text-[#6594ED] text-[13px] font-bold py-1.5 px-2 flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('map')}
            >
              地图 <ChevronDown size={14} className={`transform transition-transform ${sections.map ? '' : '-rotate-90'}`} />
            </div>
            {sections.map && (
              <div className="flex flex-col gap-1 p-1">
                <button className="bg-[#5185E8] text-white text-[13px] py-1 rounded-[3px]">白板</button>
                <button className="bg-[#EAF1FF] text-[#6594ED] text-[13px] py-1 rounded-[3px] hover:bg-[#D5E4FF]">矢量</button>
                <button className="bg-[#EAF1FF] text-[#6594ED] text-[13px] py-1 rounded-[3px] hover:bg-[#D5E4FF]">影像</button>
                <button className="bg-[#EAF1FF] text-[#6594ED] text-[13px] py-1 rounded-[3px] hover:bg-[#D5E4FF]">地形</button>
              </div>
            )}
          </div>
          
          {/* Section: 操作 */}
          <div className="bg-white border border-[#C1D6FF] rounded-[5px] overflow-hidden shadow-sm">
            <div 
              className="bg-[#EAF1FF] text-[#6594ED] text-[13px] font-bold py-1.5 px-2 flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('operation')}
            >
              操作 <ChevronDown size={14} className={`transform transition-transform ${sections.operation ? '' : '-rotate-90'}`} />
            </div>
            {sections.operation && (
              <div className="flex flex-col gap-1 p-1">
                <button className="bg-[#EAF1FF] text-[#6594ED] text-[13px] py-1 rounded-[3px] hover:bg-[#D5E4FF]">复位</button>
                <button className="bg-[#EAF1FF] text-[#6594ED] text-[13px] py-1 rounded-[3px] hover:bg-[#D5E4FF]">放大</button>
                <button className="bg-[#EAF1FF] text-[#6594ED] text-[13px] py-1 rounded-[3px] hover:bg-[#D5E4FF]">缩小</button>
                <button className="bg-[#EAF1FF] text-[#6594ED] text-[13px] py-1 rounded-[3px] hover:bg-[#D5E4FF]">测距</button>
                <button className="bg-[#EAF1FF] text-[#6594ED] text-[13px] py-1 rounded-[3px] hover:bg-[#D5E4FF]">测面</button>
                <button className="bg-[#EAF1FF] text-[#6594ED] text-[13px] py-1 rounded-[3px] hover:bg-[#D5E4FF]">锁定</button>
              </div>
            )}
          </div>
          
          {/* Section: 标绘 */}
          <div className="bg-white border border-[#C1D6FF] rounded-[5px] overflow-hidden shadow-sm">
            <div 
              className="bg-[#EAF1FF] text-[#6594ED] text-[13px] font-bold py-1.5 px-2 flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('plot')}
            >
              标绘 <ChevronDown size={14} className={`transform transition-transform ${sections.plot ? '' : '-rotate-90'}`} />
            </div>
            {sections.plot && (
              <div className="flex flex-col gap-1 p-1">
                <button className="bg-[#EAF1FF] text-[#6594ED] text-[13px] py-1 rounded-[3px] hover:bg-[#D5E4FF]">标点</button>
                <button className="bg-[#EAF1FF] text-[#6594ED] text-[13px] py-1 rounded-[3px] hover:bg-[#D5E4FF]">标线</button>
                <button className="bg-[#EAF1FF] text-[#6594ED] text-[13px] py-1 rounded-[3px] hover:bg-[#D5E4FF]">标面</button>
                <button className="bg-[#EAF1FF] text-[#6594ED] text-[13px] py-1 rounded-[3px] hover:bg-[#D5E4FF]">清除</button>
                <button className="bg-[#EAF1FF] text-[#6594ED] text-[13px] py-1 rounded-[3px] hover:bg-[#D5E4FF]">删除</button>
              </div>
            )}
          </div>
          
          {/* Section: 工具 */}
          <div className="bg-white border border-[#C1D6FF] rounded-[5px] overflow-hidden shadow-sm">
            <div 
              className="bg-[#EAF1FF] text-[#6594ED] text-[13px] font-bold py-1.5 px-2 flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('tool')}
            >
              工具 <ChevronDown size={14} className={`transform transition-transform ${sections.tool ? '' : '-rotate-90'}`} />
            </div>
            {sections.tool && (
              <div className="flex flex-col gap-1 p-1">
                <button className="bg-[#EAF1FF] text-[#6594ED] text-[13px] py-1 rounded-[3px] hover:bg-[#D5E4FF]">剖面</button>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Large Panel Container */}
        <div className={`absolute top-0 right-[16px] transition-all duration-300 origin-top ${isPanelExpanded ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
          
          <div className="w-[340px] bg-[#F8FAFF] border border-[#C1D6FF] rounded-[5px] shadow-sm flex flex-col p-2 gap-2 relative">
            {/* Triangle Pointer */}
            <div 
              className="absolute -top-[8px] w-4 h-4 bg-[#F8FAFF] border-t border-l border-[#C1D6FF] transform rotate-45 transition-all duration-300 z-10 rounded-tl-[2px]"
              style={{ right: getTriangleOffset(activeTopButton) }}
            ></div>
            
            {activeTopButton === 'distribution' && (
              <>
                {/* Panel Section 1: 作业网 */}
                <div className="bg-white rounded-[5px] p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-[#333333] font-bold text-[14px]">
                      <div className="w-4 h-4 text-[#6594ED]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                      </div>
                      作业网
                    </div>
                    <select className="border border-[#C1D6FF] rounded-[3px] text-[13px] text-[#666666] px-2 py-1 outline-none">
                      <option>全国</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-2 gap-x-1">
                    <CheckboxItem label="高炮作业点" icon={<div className="w-3 h-3 bg-[#8B5A2B]"></div>} checked />
                    <CheckboxItem label="固定作业点" icon={<div className="w-3 h-3 border-2 border-[#5185E8]"></div>} checked />
                    <CheckboxItem label="火箭作业点" icon={<div className="w-3 h-3 rounded-full bg-[#7A8B99]"></div>} checked />
                    <CheckboxItem label="移动作业点" icon={<div className="w-3 h-3 rounded-full border-2 border-[#34A853]"></div>} checked />
                    <CheckboxItem label="烟炉作业点" icon={<div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-[#EA4335]"></div>} />
                    <CheckboxItem label="临时作业点" icon={<div className="w-3 h-3 border-2 border-[#FBBC05] transform rotate-45"></div>} />
                    <CheckboxItem label="地面空域" icon={<div className="w-3 h-3 bg-[#8AB4F8] opacity-50 border border-[#5185E8]"></div>} />
                    <CheckboxItem label="机场" icon={<div className="w-4 h-4 rounded-full bg-[#A142F4] flex items-center justify-center text-white text-[8px]">✈</div>} />
                    <CheckboxItem label="飞机空域" icon={<div className="w-3 h-3 bg-[#81C995] opacity-50 border border-[#34A853]"></div>} />
                    <CheckboxItem label="无人机起降点" icon={<div className="w-4 h-4 rounded-full bg-[#34A853] flex items-center justify-center text-white text-[8px]">🚁</div>} />
                    <CheckboxItem label="保障作业点" icon={<div className="w-2 h-2 rounded-full bg-[#5185E8]"></div>} />
                    <CheckboxItem label="专项飞机停靠点" icon={<div className="w-3 h-3 border border-[#999999]"></div>} />
                    <CheckboxItem label="飞机作业空域分区图" className="col-span-2" />
                  </div>
                </div>

                {/* Panel Section 2: 流域图层 */}
                <div className="bg-white rounded-[5px] p-3">
                  <div className="flex items-center gap-2 text-[#333333] font-bold text-[14px] mb-3">
                    <div className="w-4 h-4 text-[#6594ED]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    流域图层
                  </div>
                  <CheckboxItem label="汉江流域" />
                </div>

                {/* Panel Section 3: 专项服务 */}
                <div className="bg-white rounded-[5px] p-3">
                  <div className="flex items-center gap-2 text-[#333333] font-bold text-[14px] mb-3">
                    <div className="w-4 h-4 text-[#6594ED]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    专项服务
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-1 mb-3">
                    <CheckboxItem label="管制区" icon={<div className="w-4 h-4 rounded-full border-2 border-[#34A853] flex items-center justify-center"><div className="w-2 h-2 bg-[#34A853]"></div></div>} />
                    <CheckboxItem label="火点分布" icon={<div className="w-4 h-4 rounded-full bg-[#EA4335] flex items-center justify-center text-white text-[10px]">🔥</div>} />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <CheckboxItem label="保障圈" icon={<div className="w-4 h-4 rounded-full border-2 border-[#FF9B53] flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-[#FF9B53]"></div></div>} checked />
                      <select className="border border-[#C1D6FF] rounded-[3px] text-[13px] text-[#666666] px-2 py-1 outline-none w-[140px]">
                        <option>北京保障圈</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <CheckboxItem label="专项服务空域" />
                      <select className="border border-[#C1D6FF] rounded-[3px] text-[13px] text-[#999999] px-2 py-1 outline-none w-[140px]">
                        <option>请选择专项服务空域</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <CheckboxItem label="专项服务装备" />
                      <select className="border border-[#C1D6FF] rounded-[3px] text-[13px] text-[#999999] px-2 py-1 outline-none w-[140px]">
                        <option>请选择专项服务装备</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <CheckboxItem label="外场试验" />
                      <select className="border border-[#C1D6FF] rounded-[3px] text-[13px] text-[#999999] px-2 py-1 outline-none w-[140px]">
                        <option>请选择外场试验</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <CheckboxItem label="93保障预设航线" />
                      <select className="border border-[#C1D6FF] rounded-[3px] text-[13px] text-[#999999] px-2 py-1 outline-none w-[140px]">
                        <option>请选择93保障预设航...</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTopButton === 'weather' && (
              <div className="flex flex-col h-[650px] max-h-[calc(100vh-100px)] -mx-2 -mt-2">
                {/* Tabs */}
                <div className="flex border-b border-[#C1D6FF] shrink-0 bg-white rounded-t-[5px] px-2 pt-1">
                  <div className={`flex-1 text-center py-2 text-[14px] cursor-pointer ${weatherTab === 'observation' ? 'text-[#5185E8] border-b-2 border-[#5185E8] font-bold' : 'text-[#999999]'}`} onClick={() => setWeatherTab('observation')}>观测产品</div>
                  <div className={`flex-1 text-center py-2 text-[14px] cursor-pointer ${weatherTab === 'forecast' ? 'text-[#5185E8] border-b-2 border-[#5185E8] font-bold' : 'text-[#999999]'}`} onClick={() => setWeatherTab('forecast')}>预报产品</div>
                  <div className={`flex-1 text-center py-2 text-[14px] cursor-pointer ${weatherTab === 'warning' ? 'text-[#5185E8] border-b-2 border-[#5185E8] font-bold' : 'text-[#999999]'}`} onClick={() => setWeatherTab('warning')}>外推预警</div>
                </div>
                
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-2">
                  {weatherTab === 'observation' && (
                    <>
                      {/* 卫星观测 */}
                      <div className="bg-white rounded-[5px] p-3">
                        <div className="flex items-center gap-2 text-[#333333] font-bold text-[13px] mb-3">
                          <Layers size={14} className="text-[#6594ED]" /> 卫星观测
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[12px] text-[#666666]">
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">FY2G人影中心产品</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">FY4B卫星中心产品</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">FY4B人影中心产品</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">FY3G卫星中心产品</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">FY3F卫星中心产品</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">FY4BAI全天时</div>
                        </div>
                      </div>

                      {/* 雷达观测 */}
                      <div className="bg-white rounded-[5px] p-3">
                        <div className="flex items-center gap-2 text-[#333333] font-bold text-[13px] mb-3">
                          <Layers size={14} className="text-[#6594ED]" /> 雷达观测
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[12px]">
                          <div 
                            className={`text-center py-1.5 rounded-[3px] cursor-pointer ${activeSubCategory === '全国拼图V3' ? 'bg-[#5185E8] text-white' : 'text-[#666666] hover:text-[#5185E8]'}`}
                            onClick={() => setActiveSubCategory(activeSubCategory === '全国拼图V3' ? null : '全国拼图V3')}
                          >
                            全国拼图V3
                          </div>
                          <div 
                            className={`text-center py-1.5 rounded-[3px] cursor-pointer ${activeSubCategory === '全国拼图V3.1' ? 'bg-[#5185E8] text-white' : 'text-[#666666] hover:text-[#5185E8]'}`}
                            onClick={() => setActiveSubCategory(activeSubCategory === '全国拼图V3.1' ? null : '全国拼图V3.1')}
                          >
                            全国拼图V3.1
                          </div>
                          <div 
                            className={`text-center py-1.5 rounded-[3px] cursor-pointer ${activeSubCategory === '单站雷达' ? 'bg-[#5185E8] text-white' : 'text-[#666666] hover:text-[#5185E8]'}`}
                            onClick={() => setActiveSubCategory(activeSubCategory === '单站雷达' ? null : '单站雷达')}
                          >
                            单站雷达
                          </div>
                          <div 
                            className={`text-center py-1.5 rounded-[3px] cursor-pointer ${activeSubCategory === 'X波段雷达' ? 'bg-[#5185E8] text-white' : 'text-[#666666] hover:text-[#5185E8]'}`}
                            onClick={() => setActiveSubCategory(activeSubCategory === 'X波段雷达' ? null : 'X波段雷达')}
                          >
                            X波段雷达
                          </div>
                        </div>
                        {activeSubCategory && ['全国拼图V3', '全国拼图V3.1', '单站雷达', 'X波段雷达'].includes(activeSubCategory) && (
                          <div className="bg-[#EAF1FF] -mx-3 -mb-3 mt-3 p-3 border-t border-[#C1D6FF] rounded-b-[5px]">
                            <div className="grid grid-cols-3 gap-1 text-[12px]">
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '组合反射率' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('组合反射率')}
                              >
                                组合反射率
                              </div>
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '等高面反射率' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('等高面反射率')}
                              >
                                等高面反射率
                              </div>
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '1小时降水估测' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('1小时降水估测')}
                              >
                                1小时降水估测
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 地面观测 */}
                      <div className="bg-white rounded-[5px] p-3">
                        <div className="flex items-center gap-2 text-[#333333] font-bold text-[13px] mb-3">
                          <Layers size={14} className="text-[#6594ED]" /> 地面观测
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[12px] text-[#666666]">
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">自动站雨量</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">闪电定位</div>
                        </div>
                      </div>

                      {/* 多源融合 */}
                      <div className="bg-white rounded-[5px] p-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-[#333333] font-bold text-[13px]">
                            <Layers size={14} className="text-[#6594ED]" /> 多源融合
                          </div>
                          <select className="border border-[#C1D6FF] rounded-[3px] text-[12px] text-[#666666] px-2 py-0.5 outline-none bg-white">
                            <option>全国</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[12px] text-[#666666]">
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">HRCLDAS</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">降水融合1km</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">三维云量</div>
                        </div>
                      </div>

                      {/* 监测预警 */}
                      <div className="bg-white rounded-[5px] p-3">
                        <div className="flex items-center gap-2 text-[#333333] font-bold text-[13px] mb-3">
                          <Layers size={14} className="text-[#6594ED]" /> 监测预警
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[12px] text-[#666666]">
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">增雨临近预警</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">冰雹临近预警</div>
                        </div>
                      </div>

                      {/* 作业信息 */}
                      <div className="bg-white rounded-[5px] p-3">
                        <div className="flex items-center gap-2 text-[#333333] font-bold text-[13px] mb-3">
                          <Layers size={14} className="text-[#6594ED]" /> 作业信息
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <div className="w-3.5 h-3.5 rounded-[2px] border border-[#C1D6FF] bg-white flex items-center justify-center shrink-0"></div>
                            <span className="text-[12px] text-[#666666]">地面作业</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <div className="w-3.5 h-3.5 rounded-[2px] border border-[#C1D6FF] bg-white flex items-center justify-center shrink-0"></div>
                            <span className="text-[12px] text-[#666666]">飞机作业</span>
                          </label>
                        </div>
                      </div>

                      {/* 其他 */}
                      <div className="bg-white rounded-[5px] p-3">
                        <div className="flex items-center gap-2 text-[#333333] font-bold text-[13px] mb-3">
                          <Layers size={14} className="text-[#6594ED]" /> 其他
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[12px] text-[#666666]">
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">高空气象产品</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">天气分析图</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">天空成像仪</div>
                        </div>
                      </div>
                    </>
                  )}

                  {weatherTab === 'forecast' && (
                    <>
                      {/* CMA-CPEFS_V2.0_1km催化云 */}
                      <div className="bg-white rounded-[5px] p-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-[#333333] font-bold text-[13px] truncate pr-2">
                            <Layers size={14} className="text-[#6594ED] shrink-0" /> 
                            <span className="truncate">CMA-CPEFS_V2.0_1km催化云</span>
                          </div>
                          <select className="border border-[#C1D6FF] rounded-[3px] text-[12px] text-[#666666] px-1 py-0.5 outline-none bg-white shrink-0">
                            <option>华北区域</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-3 gap-y-3 gap-x-2 text-[12px] text-[#666666]">
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">云微观场</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">催化</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">降水</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">增雨量</div>
                        </div>
                      </div>

                      {/* CMA-CPEFS_V2.0_华北区域_2.7km */}
                      <div className="bg-white rounded-[5px] p-3">
                        <div className="flex items-center gap-2 text-[#333333] font-bold text-[13px] mb-3">
                          <Layers size={14} className="text-[#6594ED] shrink-0" /> CMA-CPEFS_V2.0_华北区域_2.7km
                        </div>
                        <div className="grid grid-cols-3 gap-y-3 gap-x-2 text-[12px] text-[#666666]">
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">云宏观场</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">云微观场</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">形势场</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">降水场</div>
                        </div>
                      </div>

                      {/* CMA-CPEFS_V2.0_华北区域_900m */}
                      <div className="bg-white rounded-[5px] p-3">
                        <div className="flex items-center gap-2 text-[#333333] font-bold text-[13px] mb-3">
                          <Layers size={14} className="text-[#6594ED] shrink-0" /> CMA-CPEFS_V2.0_华北区域_900m
                        </div>
                        <div className="grid grid-cols-3 gap-y-3 gap-x-2 text-[12px] text-[#666666]">
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">云宏观场</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">云微观场</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">形势场</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">降水场</div>
                        </div>
                      </div>

                      {/* CMA-CPEFS_V2.0_华北区域_300m */}
                      <div className="bg-white rounded-[5px] p-3">
                        <div className="flex items-center gap-2 text-[#333333] font-bold text-[13px] mb-3">
                          <Layers size={14} className="text-[#6594ED] shrink-0" /> CMA-CPEFS_V2.0_华北区域_300m
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[12px]">
                          <div 
                            className={`text-center py-1.5 rounded-[3px] cursor-pointer ${activeSubCategory === '云宏观场' ? 'bg-[#5185E8] text-white' : 'text-[#666666] hover:text-[#5185E8]'}`}
                            onClick={() => setActiveSubCategory(activeSubCategory === '云宏观场' ? null : '云宏观场')}
                          >
                            云宏观场
                          </div>
                          <div 
                            className={`text-center py-1.5 rounded-[3px] cursor-pointer ${activeSubCategory === '云微观场' ? 'bg-[#5185E8] text-white' : 'text-[#666666] hover:text-[#5185E8]'}`}
                            onClick={() => setActiveSubCategory(activeSubCategory === '云微观场' ? null : '云微观场')}
                          >
                            云微观场
                          </div>
                          <div 
                            className={`text-center py-1.5 rounded-[3px] cursor-pointer ${activeSubCategory === '形势场' ? 'bg-[#5185E8] text-white' : 'text-[#666666] hover:text-[#5185E8]'}`}
                            onClick={() => setActiveSubCategory(activeSubCategory === '形势场' ? null : '形势场')}
                          >
                            形势场
                          </div>
                          <div 
                            className={`text-center py-1.5 rounded-[3px] cursor-pointer ${activeSubCategory === '降水场' ? 'bg-[#5185E8] text-white' : 'text-[#666666] hover:text-[#5185E8]'}`}
                            onClick={() => setActiveSubCategory(activeSubCategory === '降水场' ? null : '降水场')}
                          >
                            降水场
                          </div>
                        </div>
                        {activeSubCategory && ['云宏观场', '云微观场', '形势场', '降水场'].includes(activeSubCategory) && (
                          <div className="bg-[#EAF1FF] -mx-3 -mb-3 mt-3 p-3 border-t border-[#C1D6FF] rounded-b-[5px]">
                            <div className="grid grid-cols-2 gap-y-3 gap-x-1 text-[12px]">
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '云带' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('云带')}
                              >
                                云带
                              </div>
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '垂直累积液态水' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('垂直累积液态水')}
                              >
                                垂直累积液态水
                              </div>
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '垂直累积过冷水' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('垂直累积过冷水')}
                              >
                                垂直累积过冷水
                              </div>
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '云顶高度' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('云顶高度')}
                              >
                                云顶高度
                              </div>
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '云顶温度' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('云顶温度')}
                              >
                                云顶温度
                              </div>
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '云底高度' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('云底高度')}
                              >
                                云底高度
                              </div>
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '云底温度' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('云底温度')}
                              >
                                云底温度
                              </div>
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '最大反射率' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('最大反射率')}
                              >
                                最大反射率
                              </div>
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '云量' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('云量')}
                              >
                                云量
                              </div>
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '垂直积分冰面过饱和水汽' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('垂直积分冰面过饱和水汽')}
                              >
                                垂直积分冰面过饱和水汽
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CMA-MESO模式_3km */}
                      <div className="bg-white rounded-[5px] p-3">
                        <div className="flex items-center gap-2 text-[#333333] font-bold text-[13px] mb-3">
                          <Layers size={14} className="text-[#6594ED] shrink-0" /> CMA-MESO模式_3km
                        </div>
                        <div className="grid grid-cols-3 gap-y-3 gap-x-2 text-[12px] text-[#666666]">
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">云宏观场</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">云微观场</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">形势场</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">降水场</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">不稳定指数类</div>
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">地面分析</div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {weatherTab === 'warning' && (
                    <>
                      {/* 雷达外推 */}
                      <div className="bg-white rounded-[5px] p-3">
                        <div className="flex items-center gap-2 text-[#333333] font-bold text-[13px] mb-3">
                          <Layers size={14} className="text-[#6594ED]" /> 雷达外推
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[12px]">
                          <div 
                            className={`text-center py-1.5 rounded-[3px] cursor-pointer ${activeSubCategory === 'SWAN雷达' ? 'bg-[#5185E8] text-white' : 'text-[#666666] hover:text-[#5185E8]'}`}
                            onClick={() => setActiveSubCategory(activeSubCategory === 'SWAN雷达' ? null : 'SWAN雷达')}
                          >
                            SWAN雷达
                          </div>
                          <div 
                            className={`text-center py-1.5 rounded-[3px] cursor-pointer ${activeSubCategory === '风雷模型外推' ? 'bg-[#5185E8] text-white' : 'text-[#666666] hover:text-[#5185E8]'}`}
                            onClick={() => setActiveSubCategory(activeSubCategory === '风雷模型外推' ? null : '风雷模型外推')}
                          >
                            风雷模型外推
                          </div>
                          <div 
                            className={`text-center py-1.5 rounded-[3px] cursor-pointer ${activeSubCategory === 'AI_MDTS外推' ? 'bg-[#5185E8] text-white' : 'text-[#666666] hover:text-[#5185E8]'}`}
                            onClick={() => setActiveSubCategory(activeSubCategory === 'AI_MDTS外推' ? null : 'AI_MDTS外推')}
                          >
                            AI_MDTS外推
                          </div>
                          <div 
                            className={`text-center py-1.5 rounded-[3px] cursor-pointer ${activeSubCategory === 'SCIT风暴追踪' ? 'bg-[#5185E8] text-white' : 'text-[#666666] hover:text-[#5185E8]'}`}
                            onClick={() => setActiveSubCategory(activeSubCategory === 'SCIT风暴追踪' ? null : 'SCIT风暴追踪')}
                          >
                            SCIT风暴追踪
                          </div>
                          <div 
                            className={`text-center py-1.5 rounded-[3px] cursor-pointer ${activeSubCategory === '集合外推' ? 'bg-[#5185E8] text-white' : 'text-[#666666] hover:text-[#5185E8]'}`}
                            onClick={() => setActiveSubCategory(activeSubCategory === '集合外推' ? null : '集合外推')}
                          >
                            集合外推
                          </div>
                        </div>
                        {activeSubCategory && ['SWAN雷达', '风雷模型外推', 'AI_MDTS外推', 'SCIT风暴追踪', '集合外推'].includes(activeSubCategory) && (
                          <div className="bg-[#EAF1FF] -mx-3 -mb-3 mt-3 p-3 border-t border-[#C1D6FF] rounded-b-[5px]">
                            <div className="grid grid-cols-3 gap-y-3 gap-x-1 text-[12px]">
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '组合反射率拼图' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('组合反射率拼图')}
                              >
                                组合反射率拼图
                              </div>
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '回波顶高拼图' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('回波顶高拼图')}
                              >
                                回波顶高拼图
                              </div>
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '垂直液态水含量' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('垂直液态水含量')}
                              >
                                垂直液态水含量
                              </div>
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '1小时降水估测' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('1小时降水估测')}
                              >
                                1小时降水估测
                              </div>
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '降水临近预报' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('降水临近预报')}
                              >
                                降水临近预报
                              </div>
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '冰雹临近预警' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('冰雹临近预警')}
                              >
                                冰雹临近预警
                              </div>
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === 'TITAN风暴追踪' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('TITAN风暴追踪')}
                              >
                                TITAN风暴追踪
                              </div>
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '反射率临近预报' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('反射率临近预报')}
                              >
                                反射率临近预报
                              </div>
                              <div 
                                className={`text-center py-1 rounded-[3px] cursor-pointer ${activeSubProduct === '回波反射率' ? 'bg-[#C1D6FF] text-[#5185E8]' : 'text-[#666666] hover:text-[#5185E8]'}`}
                                onClick={() => setActiveSubProduct('回波反射率')}
                              >
                                回波反射率
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 卫星外推 */}
                      <div className="bg-white rounded-[5px] p-3">
                        <div className="flex items-center gap-2 text-[#333333] font-bold text-[13px] mb-3">
                          <Layers size={14} className="text-[#6594ED]" /> 卫星外推
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[12px] text-[#666666]">
                          <div className="text-center cursor-pointer hover:text-[#5185E8]">FY4B产品</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTopButton === 'favorites' && (
              <div className="bg-white rounded-[5px] p-3 h-[200px] flex items-center justify-center text-[#666666]">
                收藏夹内容区域
              </div>
            )}

            {activeTopButton === 'special' && (
              <div className="bg-white rounded-[5px] p-3">
                <div className="flex items-center gap-2 text-[#333333] font-bold text-[14px] mb-3">
                  <div className="w-4 h-4 text-[#6594ED]">
                    <FileText size={16} />
                  </div>
                  专报指令
                </div>
                <div className="flex flex-col gap-2 text-[#666666] text-[13px]">
                  <div className="p-2 border border-[#EAF1FF] rounded bg-[#F8FAFF] hover:bg-[#EAF1FF] cursor-pointer transition-colors">
                    <div className="font-bold text-[#5185E8] mb-1">2023年第12期气象专报</div>
                    <div className="text-[12px]">发布时间: 2023-10-25 10:00</div>
                  </div>
                  <div className="p-2 border border-[#EAF1FF] rounded bg-[#F8FAFF] hover:bg-[#EAF1FF] cursor-pointer transition-colors">
                    <div className="font-bold text-[#5185E8] mb-1">关于做好近期强降水防范的指令</div>
                    <div className="text-[12px]">发布时间: 2023-10-24 15:30</div>
                  </div>
                  <div className="p-2 border border-[#EAF1FF] rounded bg-[#F8FAFF] hover:bg-[#EAF1FF] cursor-pointer transition-colors">
                    <div className="font-bold text-[#5185E8] mb-1">2023年第11期气象专报</div>
                    <div className="text-[12px]">发布时间: 2023-10-20 09:00</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

function CheckboxItem({ label, icon, checked = false, className = '' }: { label: string, icon?: React.ReactNode, checked?: boolean, className?: string }) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <div className={`w-3.5 h-3.5 rounded-[2px] border flex items-center justify-center shrink-0 ${checked ? 'bg-[#5185E8] border-[#5185E8]' : 'border-[#C1D6FF] bg-white'}`}>
        {checked && <Check size={10} color="white" strokeWidth={3} />}
      </div>
      {icon && <div className="flex items-center justify-center w-4 h-4 shrink-0">{icon}</div>}
      <span className={`text-[13px] truncate ${checked ? 'text-[#5185E8]' : 'text-[#666666]'}`}>{label}</span>
    </label>
  );
}
