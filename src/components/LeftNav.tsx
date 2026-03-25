import React, { useState } from 'react';
import { Eye, Calendar, Folder, Bell, Flag, FileCheck, ShieldCheck, Briefcase } from 'lucide-react';

const leftNavItems = [
  { name: '过程展望', icon: Eye },
  { name: '潜力计划', icon: Calendar },
  { name: '条件预案', icon: Folder },
  { name: '监测方案', icon: Bell },
  { name: '指挥实施', icon: Flag },
  { name: '效果评估', icon: FileCheck },
  { name: '安全管理', icon: ShieldCheck },
  { name: '专项服务', icon: Briefcase },
];

interface LeftNavProps {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}

export default function LeftNav({ selectedIndex, setSelectedIndex }: LeftNavProps) {
  return (
    <div className="w-[80px] h-full bg-[#D5E4FF] border-r border-[#C1D6FF] flex flex-col items-center py-4 gap-4 shrink-0 overflow-y-auto z-10 relative shadow-sm">
      {leftNavItems.map((item, index) => {
        const Icon = item.icon;
        const isSelected = index === selectedIndex;
        return (
          <div 
            key={item.name} 
            className="flex flex-col items-center gap-1.5 cursor-pointer group w-full"
            onClick={() => setSelectedIndex(index)}
          >
            <div
              className={`w-[56px] h-[56px] rounded-full flex items-center justify-center transition-colors ${
                isSelected ? 'bg-[#FF9B53]' : 'bg-[#5185E8] group-hover:bg-[#4175D8]'
              }`}
            >
              <Icon size={30} color="#FFFFFF" strokeWidth={1.5} />
            </div>
            <span className={`text-[12px] font-bold text-center ${isSelected ? 'text-[#FF9B53]' : 'text-[#5185E8]'}`}>
              {item.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
