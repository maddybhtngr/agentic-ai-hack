from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/zones", tags=["zones"])

@router.get("/")
async def get_zones():
    """Get all zones"""
    pass

@router.post("/")
async def create_zone():
    """Create a new zone"""
    pass

@router.get("/{zone_id}")
async def get_zone(zone_id: int):
    """Get a specific zone"""
    pass

@router.put("/{zone_id}")
async def update_zone(zone_id: int):
    """Update a zone"""
    pass

@router.delete("/{zone_id}")
async def delete_zone(zone_id: int):
    """Delete a zone"""
    pass 