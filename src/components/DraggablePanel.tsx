import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { X } from 'lucide-react';

let globalZIndex = 1000;

export const getNextZIndex = () => {
  globalZIndex += 1;
  return globalZIndex;
};

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface DraggablePanelProps {
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

  return (
    <Rnd
      default={{ ...defaultPosition, ...defaultSize }}
      minWidth={minWidth}
      minHeight={minHeight}
      bounds="parent"
      dragHandleClassName="drag-handle"
      className={`absolute ${isVisible ? 'block' : 'hidden'}`}
      style={{ zIndex }}
      onDragStart={bringToFront}
    >
      <div 
        className="w-full h-full bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
        onMouseDownCapture={bringToFront}
      >
        {/* 顶部标签栏 (Primary Tabs or Title) */}
        <div className="drag-handle h-10 flex items-center justify-between px-4 border-b border-gray-200 cursor-move bg-gray-50/50 shrink-0">
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
        <div className="flex-1 min-h-0 flex flex-col bg-white">
          {children}
        </div>
      </div>
    </Rnd>
  );
}
