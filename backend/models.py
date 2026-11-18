from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    area_sqft = Column(Float, nullable=True)
    predicted_cost = Column(Float, nullable=True)
    material_quality = Column(String, nullable=True)
    
    plot_width = Column(Float, nullable=True)
    plot_height = Column(Float, nullable=True)
    road_facing = Column(String, nullable=True)
    vastu_compliant = Column(Boolean, default=False)
    requires_3d_model = Column(Boolean, default=False)
    
    # Store JSON string of parsed floorplan data
    floorplan_data = Column(String, nullable=True)
