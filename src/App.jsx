import React, { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import Map from 'react-map-gl/maplibre';
import Papa from 'papaparse';
import 'maplibre-gl/dist/maplibre-gl.css';

const DARK_BASEMAP = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const INITIAL_VIEW_STATE = {
  longitude: 104.1954, // 默认中国视角
  latitude: 35.8617,
  zoom: 4,
  pitch: 45,
  bearing: 0
};

export default function App() {
  const [mapData, setMapData] = useState([]);

  // 核心逻辑：本地秒解 CSV 文件
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true, // 自动把第一行识别为 Key
      dynamicTyping: true, // 自动把数字字符串转成真数字
      skipEmptyLines: true,
      complete: (results) => {
        console.log("CSV 解析完成，拿到数据：", results.data);
        setMapData(results.data); // 把数据塞给 React 状态
      }
    });
  };

  // 核心逻辑：定义数据如何映射成视觉（这里假设 CSV 有 lng 和 lat 列）
  const pointLayer = new ScatterplotLayer({
    id: 'csv-points-layer',
    data: mapData,
    getPosition: d => [d.lng, d.lat], // ⚠️ 对应你 CSV 里的经纬度列名
    getFillColor: [255, 50, 50], // 默认全部标红 (警示感)
    getRadius: d => (d.value || 1) * 2000, // 默认半径，如果有 value 列则根据 value 放大
    radiusMinPixels: 3,
    pickable: true, // 允许鼠标悬浮拾取（为后续开发弹窗做准备）
  });

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* 1. 地图渲染引擎 */}
      <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} layers={[pointLayer]}>
        <Map mapStyle={DARK_BASEMAP} />
      </DeckGL>

      {/* 2. 悬浮的极简暗黑控制台 */}
      <div style={{
        position: 'absolute', top: 20, left: 20, width: '300px',
        padding: '20px', backgroundColor: 'rgba(20, 20, 20, 0.9)',
        border: '1px solid #444', borderRadius: '8px', color: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 1
      }}>
        <h2 style={{ margin: '0 0 5px 0', fontSize: '18px', letterSpacing: '1px' }}>极简研判舱 MVP</h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#888' }}>纯前端本地解析 / 零数据上传</p>
        
        {/* 隐藏的真实文件输入框 */}
        <input 
          type="file" 
          accept=".csv" 
          id="csv-upload" 
          style={{ display: 'none' }} 
          onChange={handleFileUpload}
        />
        
        {/* 漂亮的触发按钮 */}
        <label htmlFor="csv-upload" style={{
          display: 'block', textAlign: 'center', padding: '10px 0',
          backgroundColor: '#007BFF', color: '#fff', borderRadius: '4px',
          cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.3s'
        }}>
          📁 导入本地业务 CSV
        </label>

        {/* 数据加载状态提示 */}
        {mapData.length > 0 && (
          <div style={{ marginTop: '15px', fontSize: '13px', color: '#00FF00' }}>
            ✅ 成功加载 {mapData.length} 条数据要素
          </div>
        )}
      </div>

    </div>
  );
}