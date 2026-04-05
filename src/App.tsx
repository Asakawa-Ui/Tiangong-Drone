import React, { useState } from 'react';
import { Toaster } from 'sonner';
import TopNav from './components/TopNav';
import LeftNav from './components/LeftNav';
import MapArea from './components/MapArea';
import TabContainer from './components/TabContainer';
import WorkspaceLeft from './components/WorkspaceLeft';
import { Sortie } from './services/api';

export default function App() {
  const [leftNavIndex, setLeftNavIndex] = useState(4); // 4 is 指挥实施
  const [secondaryTabIndex, setSecondaryTabIndex] = useState(1); // 1 is 无人机作业
  const [tertiaryTabIndex, setTertiaryTabIndex] = useState(0); // 0 is 实况指挥
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  // 悬浮面板的全局控制状态
  const [panelStates, setPanelStates] = useState({
    flightParams: true,
    opCondition: true,
    uavVideo: true
  });

  // 当前选中的架次
  const [currentSortie, setCurrentSortie] = useState<Sortie | null>(null);
  
  // 架次航线的显隐状态
  const [sortieVisibility, setSortieVisibility] = useState<Record<string, boolean>>({
    s1: true,
    s2: true,
    s3: false
  });

  // 预飞航线显隐状态
  const [isRouteVisible, setIsRouteVisible] = useState(true);
  
  // 当前生效的预飞航线版本
  const [activeRoute, setActiveRoute] = useState('V1');

  // 战术图层显隐状态
  const [activeLayers, setActiveLayers] = useState({
    danger1: true,
    danger2: false,
    potential1: true
  });

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-white font-sans text-[#333333]">
      <Toaster position="top-center" />
      <TopNav />
      <div className="flex flex-1 overflow-hidden relative">
        <LeftNav selectedIndex={leftNavIndex} setSelectedIndex={setLeftNavIndex} />
        
        {/* Main Content Area Background */}
        <div className="flex flex-col flex-1 overflow-hidden bg-[#F8FAFF] p-[12px]">
          
          {leftNavIndex === 4 ? (
            <TabContainer
              level={2}
              activeTab={secondaryTabIndex}
              onTabChange={setSecondaryTabIndex}
              tabs={[
                { name: '地面作业', index: 0 },
                { name: '无人机作业', index: 1 }
              ]}
            >
              {secondaryTabIndex === 1 ? (
                <TabContainer
                  level={3}
                  activeTab={tertiaryTabIndex}
                  onTabChange={setTertiaryTabIndex}
                  tabs={[
                    { name: '实况指挥', index: 0 },
                    { name: '历史作业', index: 1 },
                    { name: '作业管理', index: 2 }
                  ]}
                >
                  {tertiaryTabIndex === 0 ? (
                    <div className="w-full h-full flex gap-[12px]">
                      {/* 左侧容器框 */}
                      <div className={
                        isMapFullscreen
                          ? "fixed top-[20px] left-[20px] bottom-[20px] z-[60] flex flex-col gap-[12px]"
                          : "h-full shrink-0 flex flex-col gap-[12px]"
                      }>
                        <WorkspaceLeft 
                          panelStates={panelStates} 
                          setPanelStates={setPanelStates}
                          currentSortie={currentSortie}
                          setCurrentSortie={setCurrentSortie}
                          sortieVisibility={sortieVisibility}
                          setSortieVisibility={setSortieVisibility}
                          isRouteVisible={isRouteVisible}
                          setIsRouteVisible={setIsRouteVisible}
                          activeRoute={activeRoute}
                          setActiveRoute={setActiveRoute}
                          activeLayers={activeLayers}
                          setActiveLayers={setActiveLayers}
                        />
                      </div>
                      {/* 右侧容器框：放地图 */}
                      <div className={
                        isMapFullscreen
                          ? "fixed inset-0 z-50 bg-[#F8FAFF]"
                          : "flex-1 h-full relative border border-[#C1D6FF] rounded-[5px] overflow-hidden"
                      }>
                        <MapArea 
                          isFullscreen={isMapFullscreen} 
                          onToggleFullscreen={() => setIsMapFullscreen(!isMapFullscreen)} 
                          panelStates={panelStates}
                          setPanelStates={setPanelStates}
                          currentSortie={currentSortie}
                          sortieVisibility={sortieVisibility}
                          isRouteVisible={isRouteVisible}
                          activeRoute={activeRoute}
                          activeLayers={activeLayers}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-[#E4E3E0] text-gray-500 rounded-[5px]">
                      {tertiaryTabIndex === 1 ? '历史作业内容区域' : '作业管理内容区域'}
                    </div>
                  )}
                </TabContainer>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-[#E4E3E0] text-gray-500 rounded-[5px]">
                  地面作业内容区域
                </div>
              )}
            </TabContainer>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#E4E3E0] text-gray-500 rounded-[5px]">
              其他模块内容区域
            </div>
          )}

        </div>
      </div>

      {/* 开发者工具：复制布局 */}
      <button
        onClick={() => {
          const layouts = (window as any).panelLayouts;
          if (layouts) {
            navigator.clipboard.writeText(JSON.stringify(layouts, null, 2));
            alert('布局已复制到剪贴板！\n' + JSON.stringify(layouts, null, 2));
          } else {
            alert('尚未记录任何布局信息，请先拖拽或缩放面板。');
          }
        }}
        className="fixed bottom-4 right-4 z-[9999] bg-black text-white px-4 py-2 rounded shadow-lg text-sm opacity-50 hover:opacity-100 transition-opacity"
      >
        复制当前布局
      </button>
    </div>
  );
}
