import React, { useState, useRef, useEffect } from 'react';
import { Video, Maximize, Minimize, Camera, WifiOff, Loader2 } from 'lucide-react';
import DraggablePanel from './DraggablePanel';

export default function UavVideoPanel({ onClose, currentSortie, isVisible = true, isMapFullscreen = false }: { onClose: () => void, currentSortie?: any, isVisible?: boolean, isMapFullscreen?: boolean }) {
  const [stream, setStream] = useState('光电吊舱');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'success' | 'error'>('connecting');
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    setConnectionStatus('connecting');
    let isMounted = true;

    const checkConnection = async () => {
      try {
        // Use no-cors to avoid CORS issues, we just want to know if the server is reachable
        await fetch('http://127.0.0.1:8889/podstream', { mode: 'no-cors', cache: 'no-store' });
        if (isMounted) {
          setConnectionStatus('success');
        }
      } catch (error) {
        if (isMounted) {
          setConnectionStatus('error');
        }
      }
    };

    // Initial check after a small delay to show "connecting" state
    const initialTimeout = setTimeout(() => {
      checkConnection();
    }, 500);

    // Polling every 3 seconds to update status dynamically
    const interval = setInterval(checkConnection, 3000);

    return () => {
      isMounted = false;
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [stream]);

  const parameters = [
    { label: '经度', value: '116.39°E' },
    { label: '纬度', value: '39.90°N' },
    { label: '海拔高度', value: '4500 m' },
    { label: '航速', value: '350 km/h' },
    { label: '航向', value: '120°' },
    { label: '大气温度', value: '-15.0 °C' },
    { label: '探测温度', value: '-14.5 °C' },
    { label: '探测湿度', value: '85 %' },
    { label: '结冰状态', value: '无结冰', color: 'text-green-400' },
  ];

  return (
    <DraggablePanel
      id="uav-video"
      title={
        <>
          <Video size={18} className="text-blue-600" />
          <span>无人机监控视频</span>
        </>
      }
      onClose={onClose}
      isVisible={isVisible}
      defaultPosition={{ x: isMapFullscreen ? 767 + 500 : 767, y: 509 }}
      defaultSize={{ width: 646, height: 415 }}
      minWidth={500}
      minHeight={350}
    >
      <div className="flex flex-col w-full h-full bg-gray-900 text-white">
        {/* Stream Selector */}
        <div className="flex items-center gap-2 p-2 bg-gray-800 shrink-0">
          {['光电吊舱', '红外相机', '下视相机'].map(s => (
            <button
              key={s}
              onClick={() => setStream(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                stream === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Camera size={14} />
              {s}
            </button>
          ))}
        </div>

        {/* Video Container */}
        <div 
          ref={videoContainerRef}
          className="relative flex-1 w-full min-h-0 bg-black overflow-hidden flex flex-col"
        >
          {/* Live Video Stream Iframe */}
          {connectionStatus === 'success' ? (
            <iframe 
              src="http://127.0.0.1:8889/podstream" 
              className="absolute inset-0 w-full h-full z-[1] pointer-events-none border-0"
              allowFullScreen
              scrolling="no"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full z-[1] bg-gray-900 flex flex-col items-center justify-center text-gray-500">
              {connectionStatus === 'connecting' ? (
                <>
                  <Loader2 size={48} className="mb-4 opacity-50 animate-spin" />
                  <p>正在建立视频连接...</p>
                </>
              ) : (
                <>
                  <WifiOff size={48} className="mb-4 opacity-50" />
                  <p>视频流信号丢失或未连接</p>
                </>
              )}
            </div>
          )}

          {/* Crosshair Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 z-10">
            <div className="w-32 h-32 border-2 border-white rounded-full relative">
              <div className="absolute top-1/2 left-[-10px] right-[-10px] h-[1px] bg-white"></div>
              <div className="absolute left-1/2 top-[-10px] bottom-[-10px] w-[1px] bg-white"></div>
            </div>
          </div>

          {/* Live Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-2 py-1 rounded text-xs font-bold text-white backdrop-blur-sm z-10">
            {connectionStatus === 'connecting' && (
              <>
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                连接中...
              </>
            )}
            {connectionStatus === 'success' && (
              <>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                LIVE - {stream}
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                连接失败
              </>
            )}
          </div>

          {/* Fullscreen Toggle */}
          <button 
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-1.5 bg-black/50 hover:bg-black/70 rounded text-white backdrop-blur-sm transition-colors z-10"
            title={isFullscreen ? "退出全屏" : "全屏显示"}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>

          {/* Parameters Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 pb-4 px-4 z-10">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-y-3 gap-x-4 text-xs">
              {parameters.map((param, idx) => (
                <div key={idx} className="flex flex-col gap-0.5">
                  <span className="text-gray-400 font-medium">{param.label}</span>
                  <span className={`font-mono font-bold ${param.color || 'text-white'}`}>
                    {param.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DraggablePanel>
  );
}
