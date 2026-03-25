import React, { useState, useEffect } from 'react';
import { Home, User, Send, Layers, MessageSquare, Settings, Link as LinkIcon, HelpCircle } from 'lucide-react';

const navItems = [
  { name: '首页', icon: Home },
  { name: '用户', icon: User },
  { name: '发布', icon: Send },
  { name: '个例', icon: Layers },
  { name: '消息', icon: MessageSquare },
  { name: '系统', icon: Settings },
  { name: '链接', icon: LinkIcon },
  { name: '帮助', icon: HelpCircle },
];

export default function TopNav() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-[70px] w-full bg-[#5487E4] flex items-center justify-between px-6 text-white shrink-0 shadow-sm z-20 relative">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#5487E4] font-black text-xs shadow-inner">
          WMC
        </div>
        <span className="text-[22px] font-bold tracking-wide" style={{ fontFamily: 'PingFang SC, sans-serif' }}>天工 V2.0 - 国家</span>
      </div>

      <div className="flex items-center h-full">
        <div className="flex h-full mr-8">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isSelected = index === 0; // Hardcode first item as selected for now
            return (
              <div
                key={item.name}
                className={`flex items-center justify-center cursor-pointer h-full transition-colors ${
                  isSelected ? 'bg-[#FF9B53] w-[90px]' : 'px-4 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon size={18} />
                  <span className="text-[16px]">{item.name}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-end justify-center text-sm min-w-[80px]">
          <span className="text-lg font-bold leading-none mb-1">
            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
          </span>
          <span className="text-xs text-white/80 leading-none mt-1">
            {currentTime.toISOString().split('T')[0]}
          </span>
        </div>
      </div>
    </div>
  );
}
