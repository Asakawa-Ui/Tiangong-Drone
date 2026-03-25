import React from 'react';

export interface TabItem {
  name: string;
  index: number;
}

interface TabContainerProps {
  tabs: TabItem[];
  activeTab: number;
  onTabChange: (index: number) => void;
  level?: 2 | 3;
  children: React.ReactNode;
  className?: string;
}

export default function TabContainer({
  tabs,
  activeTab,
  onTabChange,
  level = 2,
  children,
  className = ''
}: TabContainerProps) {
  // Define styles based on the tab level to maintain the nested visual hierarchy
  const headerBg = level === 2 ? 'bg-[#F8FAFF]' : 'bg-[#E3EDFF]';
  const unselectedTabBg = level === 2 ? 'bg-[#EAF1FF]' : 'bg-[#D5E4FF]';
  const containerShadow = level === 2 ? 'shadow-sm' : '';

  return (
    <div className={`flex-1 flex flex-col border border-[#C1D6FF] rounded-[5px] overflow-hidden bg-white ${containerShadow} ${className}`}>
      {/* Tabs Header */}
      <div className={`${headerBg} border-b border-[#C1D6FF] pt-[4px] px-[4px] flex items-end gap-1 shrink-0`}>
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.index;
          return (
            <div
              key={tab.index}
              onClick={() => onTabChange(tab.index)}
              className={`h-[36px] px-[20px] rounded-t-[5px] border border-[#C1D6FF] flex items-center justify-center text-[16px] font-bold cursor-pointer transition-colors relative ${
                isSelected
                  ? 'bg-white text-[#6594ED] border-b-white z-10'
                  : `${unselectedTabBg} text-[#6594ED] border-b-[#C1D6FF] z-0 hover:bg-white/50`
              }`}
              style={{ marginBottom: '-1px' }}
            >
              {tab.name}
            </div>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-[12px] flex flex-col overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}
