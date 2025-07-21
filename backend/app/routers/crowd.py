from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/crowd", tags=["crowd"])

@router.get("/heatmap")
async def get_heatmap_data():
    """Get crowd heatmap data"""
    pass

@router.get("/zones/{zone_id}/density")
async def get_zone_density(zone_id: int):
    """Get crowd density for a specific zone"""
    pass

@router.get("/analytics")
async def get_crowd_analytics():
    """Get crowd analytics data"""
    pass 