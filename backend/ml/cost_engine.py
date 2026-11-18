import os

def predict_cost(area_sqft: float, num_floors: int, material_quality_str: str) -> float:
    """
    Predicts construction cost using a simplified heuristic model.
    In a full production environment, this would use the Random Forest
    model (pandas, scikit-learn), but it is stubbed here for local execution.
    """
    # Map architectural styles to cost multipliers
    style_map = {
        "modern / contemporary": 1.3,
        "traditional indian": 1.15,
        "minimalist / scandinavian": 1.0,
        "industrial": 1.2,
        "mediterranean / spanish revival": 1.4
    }
    # Default to 1.0 if not found
    mat_val = style_map.get(material_quality_str.lower(), 1.0)
    
    # Base cost: ₹2,000 per sqft for standard construction in India
    # Floors multiplier: each floor adds 5% cost overhead
    base_cost = area_sqft * 2000
    floor_mult = 1 + (num_floors - 1) * 0.05
    
    cost = base_cost * floor_mult * mat_val
    return round(float(cost), 2)
