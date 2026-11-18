from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import uvicorn

# Import our modular components
from ml.cost_engine import predict_cost
from ai.vision_parser import parse_floorplan
from ai.generative_render import generate_render

app = FastAPI(title="Generative BIM API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from typing import Optional

class CostPredictionRequest(BaseModel):
    area_sqft: float
    num_floors: int
    material_quality: str # e.g. "standard", "premium", "luxury"
    plot_width: Optional[float] = None
    plot_height: Optional[float] = None
    road_facing: Optional[str] = None
    vastu_compliant: bool = False
    requires_3d_model: bool = False

@app.get("/")
def read_root():
    return {"message": "Welcome to Generative BIM API"}

@app.post("/api/cost/predict")
def predict_construction_cost(request: CostPredictionRequest):
    """
    Endpoint for Machine Learning Cost Prediction Engine
    """
    cost = predict_cost(request.area_sqft, request.num_floors, request.material_quality)
    
    response = {"predicted_cost": cost, "currency": "INR"}
    
    if request.requires_3d_model:
        w = request.plot_width if request.plot_width else 20.0
        h = request.plot_height if request.plot_height else 20.0
        response["floorplan_data"] = {
            "walls": [
                {"start": [0, 0], "end": [w, 0], "thickness": 0.5},
                {"start": [w, 0], "end": [w, h], "thickness": 0.5},
                {"start": [w, h], "end": [0, h], "thickness": 0.5},
                {"start": [0, h], "end": [0, 0], "thickness": 0.5}
            ]
        }
        
    return response

@app.post("/api/ai/parse-floorplan")
async def upload_and_parse_floorplan(file: UploadFile = File(...)):
    """
    Endpoint for AI Suggestion & Vision Pipeline (YOLOv8 + EasyOCR)
    """
    # Read image contents
    contents = await file.read()
    
    # Run vision parser
    parsed_data = parse_floorplan(contents)
    
    return {"message": "Floorplan parsed successfully", "data": parsed_data}

@app.post("/api/ai/generate-render")
async def upload_and_generate_render(file: UploadFile = File(...), style: str = "cinematic modern"):
    """
    Endpoint for Generative Interior/Exterior Rendering (Stable Diffusion)
    """
    contents = await file.read()
    
    # Run generative render
    render_url = generate_render(contents, style)
    
    return {"message": "Render generated successfully", "render_url": render_url}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
