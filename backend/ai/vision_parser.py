def parse_floorplan(image_bytes: bytes) -> dict:
    """
    Mock implementation of a YOLOv8 + EasyOCR pipeline.
    In a real scenario, this would:
    1. Run YOLOv8 to detect walls, doors, windows.
    2. Run EasyOCR to extract room labels and dimensions.
    3. Return a structured JSON representation of the floorplan.
    """
    # Simulate processing delay and return mock data
    return {
        "walls": [
            {"start": [0, 0], "end": [10, 0], "thickness": 0.2},
            {"start": [10, 0], "end": [10, 8], "thickness": 0.2},
            {"start": [10, 8], "end": [0, 8], "thickness": 0.2},
            {"start": [0, 8], "end": [0, 0], "thickness": 0.2}
        ],
        "doors": [
            {"position": [5, 0], "width": 1.0}
        ],
        "windows": [
            {"position": [0, 4], "width": 1.5}
        ],
        "rooms": [
            {"label": "Living Room", "area_sqft": 860.0}
        ]
    }
