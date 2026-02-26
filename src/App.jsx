import React, { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { TileLayer } from '@deck.gl/geo-layers'; 
import { BitmapLayer } from '@deck.gl/layers';

import Map from 'react-map-gl/maplibre';
import Papa from 'papaparse';
import 'maplibre-gl/dist/maplibre-gl.css';

import { BASEMAP_SOURCES } from './mapConfig';

const INITIAL_VIEW_STATE = {
  longitude: 104.1954,
  latitude: 35.8617,
  zoom: 4,
  pitch: 45,
  bearing: 0
};

export default function App() {
  const [mapData, setMapData] = useState([]);
  const [activeBasemap, setActiveBasemap] = useState(BASEMAP_SOURCES.CARTO_DARK);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        setMapData(results.data);
      }
    });
  };

  const pointLayer = new ScatterplotLayer({
    id: 'csv-points-layer',
    data: mapData,
    getPosition: d => [d.lng, d.lat],
    getFillColor: [255, 50, 50],
    getRadius: d => (d.value || 1) * 2000,
    radiusMinPixels: 3,
    pickable: true,
  });

  // 核心升级：同时兼容 OSM(xyz) 和 GeoServer(wms) 的栅格瓦片层
  const isDeckGlRaster = activeBasemap.type === 'deckgl-wms' || activeBasemap.type === 'deckgl-xyz';
  
  const rasterBasemapLayer = isDeckGlRaster ? new TileLayer({
    id: `raster-layer-${activeBasemap.id}`,
    data: activeBasemap.url,
    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,
    // 判断魔法：只有 WMS 才需要我们去手写拦截器，OSM 直接放行让底层自己算！
    getTileData: activeBasemap.type === 'deckgl-wms' ? ({bbox}) => {
      const { west, south, east, north } = bbox;
      return activeBasemap.url.replace('{bbox}', `${west},${south},${east},${north}`);
    } : undefined,
    renderSubLayers: props => {
      const { bbox: { west, south, east, north } } = props.tile;
      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: [west, south, east, north]
      });
    }
  }) : null;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      <DeckGL 
        initialViewState={INITIAL_VIEW_STATE} 
        controller={true} 
        layers={[rasterBasemapLayer, pointLayer].filter(Boolean)}
      >
        {activeBasemap.type === 'maplibre' && (
          <Map mapStyle={activeBasemap.url} />
        )}
      </DeckGL>

      {/* UI 控制台 */}
      <div style={{
        position: 'absolute', top: 20, left: 20, width: '300px',
        padding: '20px', backgroundColor: 'rgba(20, 20, 20, 0.9)',
        border: '1px solid #444', borderRadius: '8px', color: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 1
      }}>
        <h2 style={{ margin: '0 0 5px 0', fontSize: '18px', letterSpacing: '1px' }}>极简研判舱 MVP</h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#888' }}>纯前端本地解析 / 零数据上传</p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>
            🗺️ 底图服务源：
          </label>
          <select 
            value={activeBasemap.id} 
            onChange={(e) => {
              const selectedConfig = Object.values(BASEMAP_SOURCES).find(src => src.id === e.target.value);
              setActiveBasemap(selectedConfig);
            }}
            style={{ 
              width: '100%', padding: '8px', backgroundColor: '#333', color: '#fff', 
              border: '1px solid #555', borderRadius: '4px', cursor: 'pointer' 
            }}
          >
            {Object.values(BASEMAP_SOURCES).map(source => (
              <option key={source.id} value={source.id}>{source.name}</option>
            ))}
          </select>
        </div>
        
        <input 
          type="file" 
          accept=".csv" 
          id="csv-upload" 
          style={{ display: 'none' }} 
          onChange={handleFileUpload}
        />
        
        <label htmlFor="csv-upload" style={{
          display: 'block', textAlign: 'center', padding: '10px 0',
          backgroundColor: '#007BFF', color: '#fff', borderRadius: '4px',
          cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.3s'
        }}>
          📁 导入本地业务 CSV
        </label>
      </div>
    </div>
  );
}