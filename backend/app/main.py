from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from app.api.trips import router as trips_router
from app.api.itineraries import router as itineraries_router
from app.api.activities import router as activities_router
from app.api.generation import router as generation_router
from app.api.chat import router as chat_router
from app.api.trip_chat import router as trip_chat_router
from app.api.disruptions import router as disruptions_router
from app.api.alternatives import router as alternatives_router
from app.api.constraints import router as constraints_router
from app.api.agent_runs import router as agent_runs_router

from app.services.demo_seed import seed_demo_data


app = FastAPI(
    title="TravelPilot API",
    description="Intelligent Trip Planning & Disruption Management Agent",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trips_router)
app.include_router(itineraries_router)
app.include_router(activities_router)
app.include_router(generation_router)
app.include_router(chat_router)
app.include_router(trip_chat_router)
app.include_router(disruptions_router)
app.include_router(alternatives_router)
app.include_router(constraints_router)
app.include_router(agent_runs_router)


@app.on_event("startup")
def startup_event():
    seed_demo_data()


@app.get("/")
def root():
    return {
        "message": "TravelPilot API is running",
        "status": "ok",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }
