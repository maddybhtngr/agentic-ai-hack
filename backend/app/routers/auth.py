from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/login")
async def login():
    """User login endpoint"""
    pass

@router.post("/signup")
async def signup():
    """User registration endpoint"""
    pass

@router.post("/logout")
async def logout():
    """User logout endpoint"""
    pass 