import React, { useState, useRef } from 'react';
import { DraggableObjectListItemDTO } from '../types/attachment';

interface DraggableAttachmentItemProps {
  item: DraggableObjectListItemDTO;
  children: React.ReactNode;
  className?: string;
  key?: React.Key;
}

export default function DraggableAttachmentItem({ item, children, className = '' }: DraggableAttachmentItemProps) {
  const [isPressing, setIsPressing] = useState(false);
  const pointerDownTargetRef = useRef<HTMLElement | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    pointerDownTargetRef.current = target;
    
    // Prevent pressing effects if interacting with buttons, inputs, labels, or specific no-drag areas
    if (target.closest('button, input, label, .no-drag, [role="button"], [role="switch"], [role="checkbox"], [role="radio"]')) {
      return;
    }
    
    if (item.draggable) {
      setIsPressing(true);
    }
  };

  const handlePointerUp = () => {
    setIsPressing(false);
  };

  const handleDragStart = (e: React.DragEvent) => {
    const target = pointerDownTargetRef.current;
    
    // Prevent dragging if the drag started from an interactive element
    if (target && target.closest('button, input, label, .no-drag, [role="button"], [role="switch"], [role="checkbox"], [role="radio"]')) {
      e.preventDefault();
      return;
    }

    if (!item.draggable) {
      e.preventDefault();
      if (item.dragDisabledReason) {
        console.warn(item.dragDisabledReason);
      }
      return;
    }
    
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setIsPressing(false);
  };

  return (
    <div
      className={`${className} select-none transition-transform duration-200 ${item.draggable ? 'cursor-grab' : ''} ${isPressing ? 'scale-[0.98] cursor-grabbing' : ''}`}
      draggable={item.draggable}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      title={item.dragDisabledReason || item.objectDisplayName}
    >
      {children}
    </div>
  );
}
