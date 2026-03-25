# 项目组件说明文档 (Components Documentation)

本文档记录了当前项目中已有的 React 组件，包含其中英文名称及简要概括，方便后续开发、维护和复用。

## 1. 公共组件-GIS功能快捷组件 (GISFunctionShortcuts)
- **英文名称**: `GISFunctionShortcuts`
- **中文名称**: 公共组件-GIS功能快捷组件
- **文件路径**: `src/components/GISFunctionShortcuts.tsx`
- **简要概括**: 悬浮于地图右上角的快捷操作面板，提供地图图层控制（白板、矢量、影像、地形）、操作工具（放大、缩小、测距、测面等）、标绘工具（标点、标线、标面等）、分析工具（剖面等）以及气象产品（雷达、云图、降水等）的快捷切换与展示。

## 2. 顶部导航栏组件 (TopNav)
- **英文名称**: `TopNav`
- **中文名称**: 顶部导航栏组件
- **文件路径**: `src/components/TopNav.tsx`
- **简要概括**: 位于系统最顶部的导航栏，包含系统 Logo、主标题、全局菜单（视图、工具、系统、链接、帮助等），以及右侧的实时时间显示和用户操作入口。

## 3. 左侧导航栏组件 (LeftNav)
- **英文名称**: `LeftNav`
- **中文名称**: 左侧导航栏组件
- **文件路径**: `src/components/LeftNav.tsx`
- **简要概括**: 位于系统左侧的一级功能导航菜单，包含多个功能模块的图标和文字（如综合监控、短临预报等），支持选中状态的视觉切换，用于控制主内容区域的显示。

## 4. 地图区域组件 (MapArea)
- **英文名称**: `MapArea`
- **中文名称**: 地图区域组件
- **文件路径**: `src/components/MapArea.tsx`
- **简要概括**: 基于 `react-leaflet` 封装的地图主视图区域。作为地图底图和各类空间数据的底层容器，同时内部集成了 `GISFunctionShortcuts` 组件以提供地图交互能力，并管理各类悬浮面板（如飞行参数、作业条件、无人机视频及智能对话框等）的显示状态。

## 5. 标签页容器组件 (TabContainer)
- **英文名称**: `TabContainer`
- **中文名称**: 标签页容器组件
- **文件路径**: `src/components/TabContainer.tsx`
- **简要概括**: 一个通用的标签页切换容器组件，支持多级（如二级、三级）标签样式配置。用于在有限的面板空间内组织、分类和切换不同的内容视图。

## 6. 可拖拽面板组件 (DraggablePanel)
- **英文名称**: `DraggablePanel`
- **中文名称**: 可拖拽面板组件
- **文件路径**: `src/components/DraggablePanel.tsx`
- **简要概括**: 基于 `react-rnd` 封装的可复用、可拖拽且可调整大小的悬浮面板组件。支持自定义标题、图标、标签页、关闭按钮及响应式内容区域，作为所有悬浮业务面板（如飞行参数、作业条件等）的基础容器。

## 7. 飞行参数面板组件 (FlightParametersPanel)
- **英文名称**: `FlightParametersPanel`
- **中文名称**: 飞行参数面板组件
- **文件路径**: `src/components/FlightParametersPanel.tsx`
- **简要概括**: 悬浮面板组件，用于展示实时飞行参数和气象数据。包含多个子标签页（飞行参数、雷达剖面、云参数、危险监测），并使用 Recharts 进行数据可视化（如高度、湿度、温度、速度、航向等）。

## 8. 作业条件面板组件 (OperationConditionPanel)
- **英文名称**: `OperationConditionPanel`
- **中文名称**: 作业条件面板组件
- **文件路径**: `src/components/OperationConditionPanel.tsx`
- **简要概括**: 悬浮面板组件，用于评估和展示云催化作业条件。通过散点图展示云滴浓度、作业条件等级及作业方式，并使用不同颜色标识条件等级（好、较好、一般、不可播），支持多图表时间轴同步。

## 9. 无人机视频面板组件 (UavVideoPanel)
- **英文名称**: `UavVideoPanel`
- **中文名称**: 无人机视频面板组件
- **文件路径**: `src/components/UavVideoPanel.tsx`
- **简要概括**: 悬浮面板组件，用于监控无人机实时视频流。支持切换不同视频源（光电、红外、下视），提供带十字准星的模拟实时视频画面，支持全屏切换，并叠加显示实时遥测数据（经纬度、高度、速度、温度等）。

## 10. 云参数标签页组件 (CloudParamsTab)
- **英文名称**: `CloudParamsTab`
- **中文名称**: 云参数标签页组件
- **文件路径**: `src/components/FlightParametersPanel.tsx` (作为子组件)
- **简要概括**: `FlightParametersPanel` 的子组件，用于展示云微物理数据。支持切换不同探测仪（CDP、CIP、PIP），可在折线图和散点图视图间切换，展示直径、浓度和液态水含量（LWC）等指标。

## 11. 雷达剖面与结冰监测标签页组件 (RadarProfileTab & IcingMonitorTab)
- **英文名称**: `RadarProfileTab` / `IcingMonitorTab`
- **中文名称**: 雷达剖面与结冰监测标签页组件
- **文件路径**: `src/components/FlightParametersPanel.tsx` (作为子组件)
- **简要概括**: `FlightParametersPanel` 的子组件，分别用于雷达反射率剖面和结冰危险监测的气象数据可视化展示。

## 12. 地图对话框组件 (MapChatDock)
- **英文名称**: `MapChatDock`
- **中文名称**: 地图对话框组件
- **文件路径**: `src/components/MapChatDock.tsx`
- **简要概括**: 悬浮于地图底部的智能对话框组件。提供类似聊天窗口的交互界面，包含可展开的历史消息面板、快捷指令标签（如危险区预览、航线元数据）、富文本输入区以及语音、视频、附件等快捷操作按钮，支持毛玻璃质感与展开/收起动画。

## 13. 选择控件组件 (SelectionControls)
- **英文名称**: `SelectionControls` (`Checkbox`, `Radio`, `Switch`)
- **中文名称**: 选择控件组件（复选框、单选框、开关）
- **文件路径**: `src/components/ui/SelectionControls.tsx`
- **简要概括**: 一套自定义的表单选择控件组件，包含 `Checkbox`（复选框）、`Radio`（单选框）和 `Switch`（开关）。采用统一的蓝色主题设计，支持选中、未选中、禁用状态，并在悬停（Hover）、聚焦（Focus）和按下（Pressed）时提供半透明的蓝色光环反馈动画，提升交互体验。
