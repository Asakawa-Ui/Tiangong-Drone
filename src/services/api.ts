// 模拟接口延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface Airspace {
  id: string;
  name: string;
  timeRange: string;
}

export interface Sortie {
  id: string;
  code: string;
  status?: string;
  time?: string;
  planName?: string;
}

export interface Plan {
  id: string;
  name: string;
  version: string;
  updateTime: string;
  status?: string;
}

export interface Notification {
  id: string;
  type: 'danger' | 'potential' | 'airspace';
  title: string;
  message: string;
  highlight1?: string;
  highlight2?: string;
}

export interface FlightData {
  time: string;
  altitude: number;
  temperature: number;
  humidity: number;
  speed: number;
  heading: number;
}

export interface OperationConditionData {
  time: string;
  index: number;
  cloudConcentration: number;
  isCloudy: boolean;
  cloudColor: string;
  temp: number;
  conditionLevel: string;
  conditionColor: string;
  operationMethod: string;
  methodColor: string;
}

export interface RadarData {
  time: string;
  altitude: number;
  temperature: number;
  radar: number;
}

export interface CloudData {
  time: string;
  diameter: number;
  concentration: number;
  lwc: number;
}

export interface IcingData {
  time: string;
  index: number;
  xgb1: number;
  xgb2: number;
  icingIndex: number;
  icIndex: number;
  icImproved: number;
  color: string;
  severity: string;
}

export const api = {
  // 获取当前空域列表
  async getAirspaces(): Promise<Airspace[]> {
    await delay(500);
    return [
      { id: '1', name: '13区', timeRange: '12:00 - 16:00' },
      { id: '2', name: '14-16区', timeRange: '08:00 - 18:00' },
      { id: '3', name: '20区', timeRange: '10:00 - 14:00' },
      { id: '4', name: '21区', timeRange: '14:00 - 20:00' },
      { id: '5', name: '22区', timeRange: '16:00 - 22:00' },
    ];
  },

  // 获取当前架次
  async getCurrentSortie(): Promise<Sortie> {
    await delay(400);
    return {
      id: 's1',
      code: 'UAS06399445_20260408_01',
      planName: '青海外场试飞计划方案'
    };
  },

  // 获取当前方案
  async getCurrentPlan(): Promise<Plan> {
    await delay(600);
    return {
      id: 'p1',
      name: '青海外场试飞计划方案',
      version: 'V4',
      updateTime: '12:37'
    };
  },

  // 获取实况架次列表
  async getSorties(): Promise<Sortie[]> {
    await delay(300);
    return [
      { id: 's1', code: 'UAS06399445_20260408_01', status: '飞行中', time: '07:02 - 至今', planName: '青海外场试飞计划方案' },
      { id: 's2', code: 'UAS06399445_20260408_01', status: '已完成', time: '昨日 14:00 - 16:30', planName: 'AJBGDOJrndDJ4...' },
      { id: 's3', code: 'UAS06399445_20260408_01', status: '已计划', time: '明日 08:00', planName: '常规巡检方案 - V1' },
    ];
  },

  // 获取飞行方案列表
  async getPlans(): Promise<Plan[]> {
    await delay(300);
    return [
      { id: 'p1', name: '青海外场试验试飞方案', version: 'V4', updateTime: '12:37', status: '当前生效' },
      { id: 'p2', name: '祁连山区增雨作业方案', version: 'V2', updateTime: '昨日 15:20', status: '历史方案' },
      { id: 'p3', name: '三江源生态监测方案', version: 'V1', updateTime: '03-20 09:15', status: '历史方案' },
    ];
  },

  // 获取告警通知
  async getNotifications(): Promise<Notification[]> {
    await delay(300);
    return [
      {
        id: 'n1',
        type: 'danger',
        title: '危险区告警',
        message: '架次 {h1} 的当前生效预飞航线与危险区 {h2} 存在交汇风险，建议立即核查并调整航线。',
        highlight1: 'UAS06399445_20260408_01',
        highlight2: '手动危险区-01'
      },
      {
        id: 'n2',
        type: 'potential',
        title: '潜力区提醒',
        message: '架次 {h1} 的当前生效预飞航线未覆盖有效潜力区，可能无法满足本次作业目标。',
        highlight1: 'UAS06399445_20260408_01'
      },
      {
        id: 'n3',
        type: 'airspace',
        title: '空域告警',
        message: '架次 {h1} 的当前生效预飞航线进入未批复通过空域 {h2} ，当前状态下不满足放行条件。',
        highlight1: 'UAS06399445_20260408_01',
        highlight2: '13区'
      }
    ];
  },

  // 获取飞行参数数据
  async getFlightData(): Promise<FlightData[]> {
    await delay(200);
    const data: FlightData[] = [];
    let time = new Date();
    time.setHours(7, 2, 27, 0); // 从 07:02:27 开始

    for (let i = 0; i < 100; i++) {
      // 模拟曲线走势
      const progress = i / 100;
      
      // 高度: 爬升 -> 平飞 -> 下降
      let altitude = 0;
      if (progress < 0.2) altitude = progress * 70; // 爬升到 14km
      else if (progress < 0.8) altitude = 14 + (Math.random() * 0.5 - 0.25); // 平飞波动
      else altitude = 14 - ((progress - 0.8) * 70); // 下降
      altitude = Math.max(0, altitude);

      // 温度: 随高度下降
      let temperature = 42.7 - (altitude * 6.5) + (Math.random() * 2 - 1);

      // 相对湿度: 波动
      let humidity = 30 + Math.sin(progress * Math.PI * 4) * 20 + Math.random() * 50;
      humidity = Math.min(100, Math.max(0, humidity));

      // 航速: 加速 -> 巡航 -> 减速
      let speed = 0;
      if (progress < 0.1) speed = progress * 4000; // 加速到 400km/h
      else if (progress < 0.9) speed = 400 + (Math.random() * 50 - 25); // 巡航波动
      else speed = 400 - ((progress - 0.9) * 4000); // 减速
      speed = Math.max(0, speed);

      // 航向: 0-360 波动
      let heading = (116 + progress * 360 + Math.random() * 50) % 360;

      data.push({
        time: time.toLocaleTimeString('zh-CN', { hour12: false }),
        altitude: Number(altitude.toFixed(3)),
        temperature: Number(temperature.toFixed(1)),
        humidity: Math.floor(humidity),
        speed: Math.floor(speed),
        heading: Math.floor(heading),
      });

      time.setSeconds(time.getSeconds() + 10); // 每 10 秒一个数据点
    }
    return data;
  },

  // 获取作业条件数据
  async getOperationConditionData(): Promise<OperationConditionData[]> {
    await delay(200);
    const data: OperationConditionData[] = [];
    let time = new Date();
    time.setHours(7, 17, 9, 0);

    for (let i = 0; i < 150; i++) {
      const timeStr = time.toLocaleTimeString('zh-CN', { hour12: false });
      
      // 模拟入云情况 (云滴浓度)
      let cloudConcentration = 0;
      let isCloudy = false;
      if ((i > 30 && i < 50) || (i > 80 && i < 100) || (i > 120 && i < 130)) {
        cloudConcentration = Math.random() * 80 + 10;
        isCloudy = true;
      }

      // 模拟温度 (20 到 -10)
      let temp = 20 - (i / 150) * 35; 
      if (i > 40 && i < 140) {
        temp = -5 + Math.random() * 2; // 平飞阶段温度
      } else if (i >= 140) {
        temp = -5 + ((i - 140) / 10) * 25; // 下降阶段温度
      }

      // 模拟作业条件等级
      let conditionLevel = '不可播';
      let conditionColor = '#9CA3AF'; // gray
      if (isCloudy) {
        if (temp < -5) {
          conditionLevel = '好';
          conditionColor = '#3B82F6'; // blue
        } else if (temp < 0) {
          conditionLevel = '较好';
          conditionColor = '#22C55E'; // green
        } else {
          conditionLevel = '一般';
          conditionColor = '#EAB308'; // yellow
        }
      }

      // 模拟作业方式
      let operationMethod = '未入云';
      let methodColor = '#9CA3AF'; // gray
      if (isCloudy) {
        if (temp < -5) {
          operationMethod = '人工冰核';
          methodColor = '#3B82F6'; // blue
        } else if (temp < 0) {
          operationMethod = '致冷剂';
          methodColor = '#22C55E'; // green
        } else {
          operationMethod = '吸湿剂';
          methodColor = '#F97316'; // orange
        }
      }

      data.push({
        time: timeStr,
        index: i,
        cloudConcentration,
        isCloudy,
        cloudColor: isCloudy ? '#3B82F6' : '#F97316',
        temp: Number(temp.toFixed(1)),
        conditionLevel,
        conditionColor,
        operationMethod,
        methodColor,
      });

      time.setSeconds(time.getSeconds() + 75);
    }
    return data;
  },

  // 获取雷达剖面数据
  async getRadarData(): Promise<RadarData[]> {
    await delay(200);
    return Array.from({ length: 100 }).map((_, i) => {
      const time = new Date(2026, 2, 21, 7, 2 + i * 2).toLocaleTimeString('zh-CN', { hour12: false });
      // 模拟高度曲线
      let altitude = 0;
      if (i < 20) altitude = i * 0.3;
      else if (i < 80) altitude = 6;
      else altitude = 6 - (i - 80) * 0.3;
      altitude = Math.max(0, altitude);

      // 模拟温度曲线
      const temperature = 15 - altitude * 6.5 + Math.random() * 2;
      
      // 模拟雷达反射率 (仅在特定时间段有云层)
      let radar = 0;
      if (i > 30 && i < 70) {
        radar = Math.random() * 40 + 10; // 10-50 dBZ
      }

      return { 
        time, 
        altitude: Number(altitude.toFixed(2)), 
        temperature: Number(temperature.toFixed(1)), 
        radar: Number(radar.toFixed(1)) 
      };
    });
  },

  // 获取云参数数据
  async getCloudData(): Promise<CloudData[]> {
    await delay(200);
    return Array.from({ length: 150 }).map((_, i) => {
      const time = new Date(2026, 2, 21, 14, 54 + Math.floor(i / 2), (i % 2) * 30).toLocaleTimeString('zh-CN', { hour12: false });
      return {
        time,
        diameter: Math.max(0, Math.random() * 15 + (Math.sin(i / 10) * 10) + 5),
        concentration: Math.max(0, Math.random() * 600 + (Math.sin(i / 5) * 200)),
        lwc: Math.max(0, Math.random() * 0.4 + (Math.sin(i / 8) * 0.2))
      };
    });
  },

  // 获取积冰监测数据
  async getIcingData(): Promise<IcingData[]> {
    await delay(200);
    return Array.from({ length: 150 }).map((_, i) => {
      const time = new Date(2026, 2, 21, 14, 23 + Math.floor(i * 1.5)).toLocaleTimeString('zh-CN', { hour12: false });
      
      // 模拟积冰严重程度
      const severityValue = Math.random();
      let severity = 'none';
      let color = '#9CA3AF'; // 无 (灰色)
      
      if (severityValue > 0.9) {
        severity = 'heavy';
        color = '#EF4444'; // 重度 (红色)
      } else if (severityValue > 0.7) {
        severity = 'moderate';
        color = '#3B82F6'; // 中度 (蓝色)
      } else if (severityValue > 0.4) {
        severity = 'light';
        color = '#06B6D4'; // 轻度 (青色)
      }
      
      // 模拟各个指数
      const xgb1 = severity === 'heavy' ? Math.random() * 2 + 0.5 : Math.random() * 0.3;
      const xgb2 = severity === 'heavy' ? Math.random() * 2 + 0.5 : Math.random() * 0.4;
      const icingIndex = severity === 'heavy' ? -Math.random() * 2 : -Math.random() * 6 - 2;
      
      // IC指数呈现U型曲线
      const progress = i / 150;
      let icIndex = 0;
      if (progress < 0.1) icIndex = 500 - progress * 5000;
      else if (progress > 0.9) icIndex = (progress - 0.9) * 5000;
      else icIndex = Math.random() * 20;
      
      const icImproved = Math.random() > 0.95 ? Math.random() * 0.2 : 0;

      return {
        time,
        index: i,
        xgb1: Number(xgb1.toFixed(2)),
        xgb2: Number(xgb2.toFixed(2)),
        icingIndex: Number(icingIndex.toFixed(2)),
        icIndex: Number(icIndex.toFixed(0)),
        icImproved: Number(icImproved.toFixed(2)),
        color,
        severity
      };
    });
  }
};
