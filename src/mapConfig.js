// mapConfig.js

export const BASEMAP_SOURCES = {
  CARTO_DARK: {
    id: 'carto-dark',
    name: '🌐 公网 - Carto 暗黑底图',
    type: 'maplibre',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
  },
  
  // 新增：OSM 标准街道图
  OSM_STANDARD: {
    id: 'osm-standard',
    name: '🌍 公网 - OSM 标准街道图',
    type: 'deckgl-xyz', 
    // Deck.gl 原生支持替换 {z}, {x}, {y}，不需要我们写任何处理代码！
    url: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
  },

  LOCAL_GEOSERVER: {
    id: 'local-geoserver',
    name: '🏠 内网 - GeoServer 陆地多边形',
    type: 'deckgl-wms',
    // ⚠️ 注意：记得把下面 LAYERS=localmap:xxx 换回你刚才成功的那个真实名字！
    url: 'http://localhost:8088/geoserver/localmap/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=localmap:land_polygons&WIDTH=256&HEIGHT=256&SRS=EPSG:4326&BBOX={bbox}'
  }
};