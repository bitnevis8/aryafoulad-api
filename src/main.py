from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from modules.aryafoulad.missionOrder.routes import router as mission_order_router

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",  # Development frontend
        "https://aryafoulad.parandx.com",  # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers
)

# Include routers
app.include_router(mission_order_router, prefix="/aryafoulad", tags=["aryafoulad"]) 