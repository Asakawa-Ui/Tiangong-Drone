import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { X } from 'lucide-react';

let globalZIndex = 1000;

export const getNextZIndex = () => {
  globalZIndex += 1;
  return globalZIndex;
};

// Global object to store current layouts for dev purposes
(window as any).panelLayouts = (window as any).panelLayouts || {};

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface DraggablePanelProps {
  id?: string;
  title?: React.ReactNode;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  onClose?: () => void;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number | string; height: number | string };
  minWidth?: number;
  minHeight?: number;
  isVisible?: boolean;
}

export default function DraggablePanel({
  id,
  title,
  tabs,
  activeTab,
  onTabChange,
  onClose,
  children,
  defaultPosition = { x: 100, y: 100 },
  defaultSize = { width: 600, height: 500 },
  minWidth = 500,
  minHeight = 400,
  isVisible = true
}: DraggablePanelProps) {
  const [zIndex, setZIndex] = useState(() => getNextZIndex());

  const bringToFront = () => {
    setZIndex(getNextZIndex());
  };

  const handleDragStop = (e: any, d: any) => {
    if (id) {
      (window as any).panelLayouts[id] = {
        ...((window as any).panelLayouts[id] || {}),
        position: { x: d.x, y: d.y }
      };
    }
  };

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
    if (id) {
      (window as any).panelLayouts[id] = {
        ...((window as any).panelLayouts[id] || {}),
        size: { width: ref.style.width, height: ref.style.height },
        position: { x: position.x, y: position.y }
      };
    }
  };

  useEffect(() => {
    if (id && !(window as any).panelLayouts[id]) {
      (window as any).panelLayouts[id] = { position: defaultPosition, size: defaultSize };
    }
  }, [id, defaultPosition, defaultSize]);

  return (
    <Rnd
      default={{ ...defaultPosition, ...defaultSize }}
      minWidth={minWidth}
      minHeight={minHeight}
      bounds="parent"
      dragHandleClassName="drag-handle"
      className="absolute"
      style={{ zIndex, display: isVisible ? undefined : 'none' }}
      onDragStart={bringToFront}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
    >
      <div 
        className="w-full h-full uav-glass rounded-lg shadow-2xl flex flex-col overflow-hidden"
        onMouseDownCapture={bringToFront}
      >
        {/* 顶部标签栏 (Primary Tabs or Title) */}
        <div className="drag-handle h-10 flex items-center justify-between px-4 border-b border-gray-200/50 cursor-move bg-white/40 shrink-0">
          <div className="flex items-center h-full">
            {tabs && tabs.length > 0 ? (
              <div className="flex gap-6 h-full">
                {tabs.map(tab => (
                  <div
                    key={tab.id}
                    onMouseDown={(e) => e.stopPropagation()} // 防止点击切换页签时触发拖拽
                    onClick={() => onTabChange?.(tab.id)}
                    className={`h-full flex items-center gap-1.5 cursor-pointer text-[15px] font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-blue-600'
                        : 'text-gray-600 border-transparent hover:text-gray-800'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[15px] font-medium text-black flex items-center gap-1.5">{title}</div>
            )}
          </div>
          {onClose && (
            <button 
              onMouseDown={(e) => e.stopPropagation()} 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 cursor-pointer shrink-0 ml-4"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* 内容区域 */}
        <div className="flex-1 min-h-0 flex flex-col bg-white/60">
          {children}
        </div>
      </div>
    </Rnd>
  );
}
