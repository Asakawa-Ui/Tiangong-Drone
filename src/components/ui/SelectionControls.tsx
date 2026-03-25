import React from 'react';

interface SelectionControlProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  readOnly?: boolean;
}

export function Checkbox({ checked, onChange, disabled, readOnly, className = '' }: SelectionControlProps) {
  return (
    <label className={`relative flex items-center justify-center cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input 
        type="checkbox" 
        className="peer sr-only" 
        checked={checked} 
        onChange={(e) => onChange?.(e.target.checked)} 
        disabled={disabled} 
        readOnly={readOnly}
      />
      <div className="w-5 h-5 rounded-[4px] border-[2px] border-[#A0AABF] peer-checked:bg-[#2E5ED7] peer-checked:border-[#2E5ED7] transition-colors flex items-center justify-center relative z-10">
        <svg 
          className={`w-3.5 h-3.5 text-white ${checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'} transition-all duration-200`} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      {/* Hover/Focus/Pressed Ring */}
      <div className="absolute inset-0 -m-2.5 rounded-full bg-[#2E5ED7]/15 opacity-0 group-hover:opacity-100 peer-focus-visible:opacity-100 peer-active:bg-[#2E5ED7]/25 transition-opacity pointer-events-none scale-50 group-hover:scale-100 peer-focus-visible:scale-100 peer-active:scale-100 duration-200 z-0"></div>
    </label>
  );
}

export function Radio({ checked, onChange, disabled, readOnly, className = '' }: SelectionControlProps) {
  return (
    <label className={`relative flex items-center justify-center cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input 
        type="radio" 
        className="peer sr-only" 
        checked={checked} 
        onChange={(e) => onChange?.(e.target.checked)} 
        disabled={disabled} 
        readOnly={readOnly}
      />
      <div className="w-5 h-5 rounded-full border-[2px] border-[#A0AABF] peer-checked:border-[#2E5ED7] transition-colors flex items-center justify-center relative z-10">
        <div className={`w-2.5 h-2.5 rounded-full bg-[#2E5ED7] ${checked ? 'scale-100' : 'scale-0'} transition-transform duration-200`}></div>
      </div>
      {/* Hover/Focus/Pressed Ring */}
      <div className="absolute inset-0 -m-2.5 rounded-full bg-[#2E5ED7]/15 opacity-0 group-hover:opacity-100 peer-focus-visible:opacity-100 peer-active:bg-[#2E5ED7]/25 transition-opacity pointer-events-none scale-50 group-hover:scale-100 peer-focus-visible:scale-100 peer-active:scale-100 duration-200 z-0"></div>
    </label>
  );
}

export function Switch({ checked, onChange, disabled, readOnly, className = '' }: SelectionControlProps) {
  return (
    <label className={`relative flex items-center cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input 
        type="checkbox" 
        className="peer sr-only" 
        checked={checked} 
        onChange={(e) => onChange?.(e.target.checked)} 
        disabled={disabled} 
        readOnly={readOnly}
      />
      {/* Track */}
      <div className="w-9 h-3.5 rounded-full bg-[#D9DEE7] peer-checked:bg-[#B3C8F7] transition-colors relative z-0 mt-[2px]"></div>
      {/* Thumb */}
      <div className={`absolute left-0 top-0 w-5 h-5 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-transform duration-200 flex items-center justify-center z-10 ${checked ? 'translate-x-4 bg-[#2E5ED7]' : 'translate-x-0 bg-white'}`}>
        {/* Hover/Focus/Pressed Ring attached to thumb */}
        <div className="absolute inset-0 -m-2.5 rounded-full bg-[#2E5ED7]/15 opacity-0 group-hover:opacity-100 peer-focus-visible:opacity-100 peer-active:bg-[#2E5ED7]/25 transition-opacity pointer-events-none scale-50 group-hover:scale-100 peer-focus-visible:scale-100 peer-active:scale-100 duration-200 z-0"></div>
      </div>
    </label>
  );
}
