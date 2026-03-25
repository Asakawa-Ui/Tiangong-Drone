import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api, Notification } from '../services/api';

interface MapNotificationsProps {
  isFullscreen?: boolean;
}

export default function MapNotifications({ isFullscreen }: MapNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visible, setVisible] = useState<Record<string, boolean>>({
    danger: true,
    potential: true,
    airspace: true
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await api.getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    fetchNotifications();
  }, []);

  const getNotification = (type: string) => notifications.find(n => n.type === type);
  const dangerNotif = getNotification('danger');
  const potentialNotif = getNotification('potential');
  const airspaceNotif = getNotification('airspace');

  const renderMessage = (message: string, h1?: string, h2?: string, colorClass: string = '') => {
    let parts = message.split(/(\{h1\}|\{h2\})/g);
    return parts.map((part, i) => {
      if (part === '{h1}' && h1) {
        return <span key={i} className={`bg-gray-100 px-1.5 py-0.5 rounded font-medium ${colorClass}`}>{h1}</span>;
      }
      if (part === '{h2}' && h2) {
        return <span key={i} className={`bg-gray-100 px-1.5 py-0.5 rounded font-medium ${colorClass}`}>{h2}</span>;
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  return (
    <div className={`absolute top-6 z-[1000] flex flex-col gap-4 w-[380px] transition-all duration-300 ${isFullscreen ? 'left-[500px]' : 'left-6'}`}>
      {/* 危险区告警 */}
      <motion.div layout className="relative pl-6" animate={{ height: visible.danger ? 'auto' : 56 }}>
        <motion.div 
          layout
          className="absolute left-0 w-[56px] h-[56px] bg-[#C87D35] rounded-2xl flex items-center justify-center z-10 cursor-pointer"
          animate={{ 
            top: visible.danger ? 16 : 0,
            scale: visible.danger ? 1 : [1, 1.05, 1], 
            boxShadow: visible.danger ? "none" : ["0px 0px 0px rgba(200,125,53,0)", "0px 0px 15px rgba(200,125,53,0.6)", "0px 0px 0px rgba(200,125,53,0)"] 
          }}
          transition={!visible.danger ? { scale: { repeat: Infinity, duration: 2 }, boxShadow: { repeat: Infinity, duration: 2 } } : { type: "spring", stiffness: 300, damping: 25 }}
          onClick={() => setVisible(v => ({...v, danger: !v.danger}))}
        >
          <AlertTriangle size={32} color="white" strokeWidth={2} />
        </motion.div>

        <AnimatePresence>
          {visible.danger && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, x: -20, height: 0 }}
              animate={{ opacity: 1, scale: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, scale: 0.8, x: -20, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{ transformOrigin: "left top" }}
              className="uav-glass rounded-2xl w-full overflow-hidden"
            >
              <div className="p-4 pl-[46px]">
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className="text-[16px] font-bold text-[#1A2238]">{dangerNotif?.title || '危险区告警'}</h3>
                  <button onClick={() => setVisible(v => ({...v, danger: false}))} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>
                <p className="text-[14px] text-[#5B6575] leading-relaxed mb-4">
                  {dangerNotif ? renderMessage(dangerNotif.message, dangerNotif.highlight1, dangerNotif.highlight2, 'text-[#C87D35]') : '加载中...'}
                </p>
                <div className="flex gap-2.5">
                  <button className="bg-[#C87D35] hover:bg-[#D98A3C] text-white px-4 py-1.5 rounded-lg text-[14px] font-bold transition-colors">
                    查看危险区
                  </button>
                  <button className="bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1F2937] px-4 py-1.5 rounded-lg text-[14px] font-bold transition-colors">
                    调整航线
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 潜力区提醒 */}
      <motion.div layout className="relative pl-6" animate={{ height: visible.potential ? 'auto' : 56 }}>
        <motion.div 
          layout
          className="absolute left-0 w-[56px] h-[56px] bg-[#15803D] rounded-2xl flex items-center justify-center z-10 cursor-pointer"
          animate={{ 
            top: visible.potential ? 16 : 0,
            scale: visible.potential ? 1 : [1, 1.05, 1], 
            boxShadow: visible.potential ? "none" : ["0px 0px 0px rgba(21,128,61,0)", "0px 0px 15px rgba(21,128,61,0.6)", "0px 0px 0px rgba(21,128,61,0)"] 
          }}
          transition={!visible.potential ? { scale: { repeat: Infinity, duration: 2 }, boxShadow: { repeat: Infinity, duration: 2 } } : { type: "spring", stiffness: 300, damping: 25 }}
          onClick={() => setVisible(v => ({...v, potential: !v.potential}))}
        >
          <svg viewBox="0 0 1024 1024" width="32" height="32" fill="white">
            <path d="M895.6 345.2c-29.6-29.6-66.5-51.5-107.2-64-9-2.8-15.7-10.4-17.4-19.6-3.4-18-9-35.5-16.9-52.4-13.1-28.3-31.8-53.6-55.6-75.3-48-43.8-111.6-67.9-179-67.9s-131 24.1-179.1 67.9c-23.8 21.7-42.5 47-55.6 75.3-8.3 17.8-14.1 36.4-17.4 55.4-3.6 20.8-19.4 37.2-39.8 42.4-36.1 9.1-69.3 26.7-96.6 51.7-42.8 39-66.4 91.2-66.4 147 0 54.2 22.4 105.3 63.1 144 26.2 24.9 58.3 42.9 93.4 52.9 28 8 56.1-12.3 57.3-41.4 0.8-20.9-12.9-39.4-33.1-45.2-52.9-15.1-90.7-58.8-90.7-110.3 0-63.9 59-115.9 131.5-115.9 7.4 0 14.8 0.5 22 1.6 45.5 6.8 83 34.2 99.9 70.7 8.3 17.9 27 28.4 46.5 26 30.1-3.8 48-35.7 35.3-63.2a205.14 205.14 0 0 0-45.1-62.9c-25.5-24.3-56.4-42.1-90.5-52.3-0.1-2.3-0.2-4.6-0.2-6.9 0-80.9 74.2-146.8 165.4-146.8s165.4 65.8 165.4 146.8c0 2.9-0.1 6-0.3 9.3l-1.4 19.3c-1 13.7 9.2 25.6 22.9 26.9l19.3 1.8c84.5 7.7 148.3 70.5 148.3 146 0 64.8-48.7 121.2-115.9 140.1-20.6 5.8-34.3 25.3-32.7 46.6 2.1 28.3 29.5 47.7 56.8 40.1C824.3 721.1 863 699 894 668.5c44.8-44.1 69.5-101.8 69.5-162.4 0-59.9-24.1-117-67.9-160.9z"></path>
            <path d="M614 588.1c-24.9 0-45 20.1-45 45v280.5c0 24.9 20.1 45 45 45s45-20.1 45-45V633.1c0-24.9-20.2-45-45-45zM441.2 588.1c-24.9 0-45 20.1-45 45v35.4c0 24.9 20.1 45 45 45s45-20.1 45-45v-35.4c0-24.9-20.2-45-45-45zM441.2 833.1c-24.9 0-45 20.1-45 45v35.4c0 24.9 20.1 45 45 45s45-20.1 45-45v-35.4c0-24.9-20.2-45-45-45z"></path>
          </svg>
        </motion.div>

        <AnimatePresence>
          {visible.potential && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, x: -20, height: 0 }}
              animate={{ opacity: 1, scale: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, scale: 0.8, x: -20, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{ transformOrigin: "left top" }}
              className="uav-glass rounded-2xl w-full overflow-hidden"
            >
              <div className="p-4 pl-[46px]">
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className="text-[16px] font-bold text-[#1A2238]">{potentialNotif?.title || '潜力区提醒'}</h3>
                  <button onClick={() => setVisible(v => ({...v, potential: false}))} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>
                <p className="text-[14px] text-[#5B6575] leading-relaxed mb-4">
                  {potentialNotif ? renderMessage(potentialNotif.message, potentialNotif.highlight1, potentialNotif.highlight2, 'text-[#15803D]') : '加载中...'}
                </p>
                <div className="flex gap-2.5">
                  <button className="bg-[#15803D] hover:bg-[#166534] text-white px-4 py-1.5 rounded-lg text-[14px] font-bold transition-colors">
                    查看潜力区
                  </button>
                  <button className="bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1F2937] px-4 py-1.5 rounded-lg text-[14px] font-bold transition-colors">
                    调整航线
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 空域告警 */}
      <motion.div layout className="relative pl-6" animate={{ height: visible.airspace ? 'auto' : 56 }}>
        <motion.div 
          layout
          className="absolute left-0 w-[56px] h-[56px] bg-[#A32A36] rounded-2xl flex items-center justify-center z-10 cursor-pointer"
          animate={{ 
            top: visible.airspace ? 16 : 0,
            scale: visible.airspace ? 1 : [1, 1.05, 1], 
            boxShadow: visible.airspace ? "none" : ["0px 0px 0px rgba(163,42,54,0)", "0px 0px 15px rgba(163,42,54,0.6)", "0px 0px 0px rgba(163,42,54,0)"] 
          }}
          transition={!visible.airspace ? { scale: { repeat: Infinity, duration: 2 }, boxShadow: { repeat: Infinity, duration: 2 } } : { type: "spring", stiffness: 300, damping: 25 }}
          onClick={() => setVisible(v => ({...v, airspace: !v.airspace}))}
        >
          <svg viewBox="0 0 1024 1024" width="32" height="32" fill="white">
            <path d="M176.288 228.288a32 32 0 0 1 38.464-35.552l592 128a32 32 0 0 1 25.152 33.92l-11.968 143.52a32 32 0 1 1-63.776-5.312l9.6-115.552L245.792 264.896l69.376 513.44 160.16-30.016a32 32 0 0 1 36.48 21.92l0.864 3.616a32 32 0 0 1-25.536 37.376l-193.248 36.224a32 32 0 0 1-37.6-27.2l-80-592z"></path>
            <path d="M128 240a80 80 0 1 0 160 0 80 80 0 0 0-160 0zM711.296 334.816a80 80 0 1 0 160 0 80 80 0 0 0-160 0zM200.224 822.688a80 80 0 1 0 160 0 80 80 0 0 0-160 0z"></path>
            <path d="M689.28 744.448v-51.52a25.76 25.76 0 1 1 51.552 0v51.52a25.76 25.76 0 1 1-51.52 0zM706.496 804.608h17.152a17.184 17.184 0 1 1 0 34.368h-17.152a17.184 17.184 0 1 1 0-34.368z"></path>
            <path d="M744.832 546.88a34.368 34.368 0 0 0-59.52 0l-178.56 309.28a34.368 34.368 0 0 0 29.76 51.52h357.12a34.368 34.368 0 0 0 29.76-51.52l-178.56-309.312z m-29.76 51.52l148.8 257.76h-297.6l148.8-257.76z"></path>
          </svg>
        </motion.div>

        <AnimatePresence>
          {visible.airspace && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, x: -20, height: 0 }}
              animate={{ opacity: 1, scale: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, scale: 0.8, x: -20, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{ transformOrigin: "left top" }}
              className="uav-glass rounded-2xl w-full overflow-hidden"
            >
              <div className="p-4 pl-[46px]">
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className="text-[16px] font-bold text-[#1A2238]">{airspaceNotif?.title || '空域告警'}</h3>
                  <button onClick={() => setVisible(v => ({...v, airspace: false}))} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>
                <p className="text-[14px] text-[#5B6575] leading-relaxed mb-4">
                  {airspaceNotif ? renderMessage(airspaceNotif.message, airspaceNotif.highlight1, airspaceNotif.highlight2, 'text-[#A32A36]') : '加载中...'}
                </p>
                <div className="flex gap-2.5">
                  <button className="bg-[#A32A36] hover:bg-[#B93240] text-white px-4 py-1.5 rounded-lg text-[14px] font-bold transition-colors">
                    查看空域批复
                  </button>
                  <button className="bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1F2937] px-4 py-1.5 rounded-lg text-[14px] font-bold transition-colors">
                    调整航线
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
