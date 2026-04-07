import React, { useState, useEffect, useRef } from 'react';
import { Home, User, Send, Layers, MessageSquare, Settings, Link as LinkIcon, HelpCircle, LogIn } from 'lucide-react';
import { useRole, ROLES, RoleType } from '../contexts/RoleContext';
import { useFirebase } from '../contexts/FirebaseContext';

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
  const { currentRole, setCurrentRole } = useRole();
  const { user, signIn } = useFirebase();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="h-[70px] w-full bg-[#5487E4] flex items-center justify-between px-6 text-white shrink-0 shadow-sm z-20 relative">
      <div className="flex items-center gap-2">
        <div className="h-14 flex items-center justify-center text-white font-black text-xs">
          <img 
            src="/uav_logo.png" 
            alt="logo" 
            className="h-full w-auto object-contain" 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.parentElement) target.parentElement.innerText = 'WMC';
            }} 
          />
        </div>
        <span className="text-[22px] font-bold tracking-wide" style={{ fontFamily: 'PingFang SC, sans-serif' }}>天工-无人机版</span>
      </div>

      <div className="flex items-center h-full">
        <div className="flex h-full mr-8 relative" ref={dropdownRef}>
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isSelected = index === 0; // Hardcode first item as selected for now
            const isUserMenu = item.name === '用户';
            
            return (
              <div
                key={item.name}
                className={`flex items-center justify-center cursor-pointer h-full transition-colors relative ${
                  isSelected ? 'bg-[#FF9B53] w-[90px]' : 'px-4 hover:bg-white/10'
                }`}
                onClick={() => {
                  if (isUserMenu) {
                    setShowRoleDropdown(!showRoleDropdown);
                  }
                }}
              >
                <div className="flex items-center gap-1.5">
                  <Icon size={18} />
                  <span className="text-[16px]">{item.name}</span>
                </div>
                
                {isUserMenu && showRoleDropdown && (
                  <div className="absolute top-[70px] left-0 w-[200px] bg-white rounded-b-lg shadow-lg py-2 text-[#333333] z-50">
                    <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                      当前角色: {currentRole.name}
                    </div>
                    {Object.entries(ROLES).map(([key, role]) => (
                      <div 
                        key={key}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${currentRole.id === key ? 'bg-blue-50 text-blue-600 font-bold' : ''}`}
                        onClick={() => {
                          setCurrentRole(key as RoleType);
                          setShowRoleDropdown(false);
                        }}
                      >
                        {role.name}
                      </div>
                    ))}
                    {!user && (
                      <div 
                        className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 border-t border-gray-100 flex items-center gap-2 text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          signIn();
                        }}
                      >
                        <LogIn size={14} />
                        <span>登录 Firebase</span>
                      </div>
                    )}
                  </div>
                )}
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
