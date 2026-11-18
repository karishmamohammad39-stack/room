import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Canvas3D from './components/Canvas3D';
import './index.css';

const API_BASE = "http://localhost:8000/api";

const CONFIGURATIONS = [
  { name: "1 BHK (Studio/Standard)", minArea: 400, maxArea: 700, defaultArea: 550, floors: 1, baseMaterial: "standard", components: "1 Bedroom, 1 Bath, Kitchen, Small Living Space" },
  { name: "2 BHK (Standard)", minArea: 800, maxArea: 1200, defaultArea: 1000, floors: 1, baseMaterial: "standard", components: "2 Bedrooms, 2 Baths, Kitchen, Living, Dining, Balcony" },
  { name: "3 BHK (Spacious)", minArea: 1300, maxArea: 2000, defaultArea: 1650, floors: 1, baseMaterial: "premium", components: "3 Bedrooms (1 Master), 3 Baths, Large Living/Dining, Utility Room" },
  { name: "4 BHK / Duplex", minArea: 2200, maxArea: 3500, defaultArea: 2800, floors: 2, baseMaterial: "premium", components: "4+ Bedrooms, Multiple Floors, Living, Family Lounge, Servant Quarter" },
  { name: "Villa / Mansion", minArea: 4000, maxArea: 8000, defaultArea: 5000, floors: 2, baseMaterial: "luxury", components: "4+ Bedrooms, Home Theater, Private Garden, Courtyard, Garage" }
];

const ARCHITECTURAL_STYLES = [
  { name: "Modern / Contemporary", keywords: "Minimalist, sleek, floor-to-ceiling windows, brutalist elements, natural light." },
  { name: "Traditional Indian", keywords: "Heritage Indian architecture, wooden pillars, central courtyard, traditional motifs, warm earthy tones." },
  { name: "Minimalist / Scandinavian", keywords: "Scandinavian design, uncluttered, bright white walls, indoor plants, light timber wood." },
  { name: "Industrial", keywords: "Exposed brick wall, metal fixtures, raw concrete, warehouse style, warm Edison lighting." },
  { name: "Mediterranean / Spanish Revival", keywords: "Arched windows, white stucco, terracotta roof, wrought iron details, sunny atmosphere." }
];

function App() {
  const [configIndex, setConfigIndex] = useState(1);
  const [styleIndex, setStyleIndex] = useState(0);
  
  const [area, setArea] = useState(1000);
  const [floors, setFloors] = useState(1);
  
  const [plotWidth, setPlotWidth] = useState("");
  const [plotHeight, setPlotHeight] = useState("");
  const [roadFacing, setRoadFacing] = useState("East");
  const [vastuCompliant, setVastuCompliant] = useState(false);
  const [plan3DModel, setPlan3DModel] = useState(false);
  
  const [cost, setCost] = useState(null);
  const [loadingCost, setLoadingCost] = useState(false);
  
  const [floorplanData, setFloorplanData] = useState(null);
  const [renderUrl, setRenderUrl] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const conf = CONFIGURATIONS[configIndex];
    setArea(conf.defaultArea);
    setFloors(conf.floors);
  }, [configIndex]);

  const fetchCost = async () => {
    setLoadingCost(true);
    try {
      const res = await axios.post(`${API_BASE}/cost/predict`, {
        area_sqft: area,
        num_floors: floors,
        material_quality: ARCHITECTURAL_STYLES[styleIndex].name,
        plot_width: plotWidth ? Number(plotWidth) : null,
        plot_height: plotHeight ? Number(plotHeight) : null,
        road_facing: roadFacing,
        vastu_compliant: vastuCompliant,
        requires_3d_model: plan3DModel
      });
      setCost(res.data.predicted_cost);
      if (res.data.floorplan_data) {
        setFloorplanData(res.data.floorplan_data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingCost(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoadingAI(true);
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      // 1. Parse Floorplan
      const parseRes = await axios.post(`${API_BASE}/ai/parse-floorplan`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFloorplanData(parseRes.data.data);
      
      // 2. Generate Render based on style
      const styleObj = ARCHITECTURAL_STYLES[styleIndex];
      const styleParam = `${styleObj.name}. Keywords: ${styleObj.keywords}`;
      const renderRes = await axios.post(`${API_BASE}/ai/generate-render?style=${encodeURIComponent(styleParam)}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setRenderUrl(renderRes.data.render_url);
    } catch (err) {
      console.error(err);
    }
    setLoadingAI(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 3D Canvas Background */}
      <Canvas3D floorplanData={floorplanData} />
      
      {/* UI Overlay: Cost Predictor & Templates */}
      <div className="glass-panel" style={{ position: 'absolute', top: 20, left: 20, width: 340, padding: 24, zIndex: 10 }}>
        <h2 style={{ marginBottom: 16, fontSize: '1.2rem', color: 'var(--accent)' }}>House Templates & Cost</h2>
        
        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Configuration (BHK)</label>
        <select className="input-field" value={configIndex} onChange={e => setConfigIndex(Number(e.target.value))}>
          {CONFIGURATIONS.map((conf, idx) => (
            <option key={idx} value={idx}>{conf.name}</option>
          ))}
        </select>

        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Architectural Style</label>
        <select className="input-field" value={styleIndex} onChange={e => setStyleIndex(Number(e.target.value))}>
          {ARCHITECTURAL_STYLES.map((style, idx) => (
            <option key={idx} value={idx}>{style.name}</option>
          ))}
        </select>
        
        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Custom Area (SqFt)</label>
        <input type="number" className="input-field" value={area} onChange={e => setArea(Number(e.target.value))} />
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.8rem' }}>Plot Width (ft)</label>
            <input type="number" className="input-field" value={plotWidth} onChange={e => setPlotWidth(e.target.value)} placeholder="e.g. 40" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.8rem' }}>Plot Height (ft)</label>
            <input type="number" className="input-field" value={plotHeight} onChange={e => setPlotHeight(e.target.value)} placeholder="e.g. 60" />
          </div>
        </div>

        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Road Facing</label>
        <select className="input-field" value={roadFacing} onChange={e => setRoadFacing(e.target.value)}>
          <option value="East">East</option>
          <option value="West">West</option>
          <option value="North">North</option>
          <option value="South">South</option>
        </select>

        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Number of Floors</label>
        <input type="number" className="input-field" value={floors} onChange={e => setFloors(Number(e.target.value))} />

        <div style={{ display: 'flex', gap: '12px', marginBottom: 12, marginTop: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={vastuCompliant} onChange={e => setVastuCompliant(e.target.checked)} />
            Use Vastu
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={plan3DModel} onChange={e => setPlan3DModel(e.target.checked)} />
            Plan 3D Model
          </label>
        </div>
        
        <button className="primary-btn" style={{ width: '100%', marginTop: 8 }} onClick={fetchCost} disabled={loadingCost}>
          {loadingCost ? 'Calculating...' : 'Predict Cost (INR)'}
        </button>
        
        {cost !== null && (
          <div style={{ marginTop: 16, padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Construction Cost</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4ade80' }}>
              ₹{cost.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* UI Overlay: AI Vision & Generative */}
      <div className="glass-panel" style={{ position: 'absolute', top: 20, right: 20, width: 340, padding: 24, zIndex: 10 }}>
        <h2 style={{ marginBottom: 16, fontSize: '1.2rem', color: 'var(--accent)' }}>AI Vision Pipeline</h2>
        
        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Upload 2D Blueprint</label>
        <input type="file" className="input-field" accept="image/*" onChange={handleFileUpload} />
        
        {loadingAI && <div style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>Processing AI models...</div>}
        
        {renderUrl && !loadingAI && (
          <div style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>Generative Interior Render</h3>
            <img src={renderUrl} alt="Generated interior" style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border-glass)' }} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
