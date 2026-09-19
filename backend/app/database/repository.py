from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from app.models.trip import Trip
from app.models.itinerary import Itinerary
from app.services.trip_store import get_trip as _get_trip, save_trip as _save_trip
from app.services.itinerary_service import get_current_itinerary as _get_itin, save_itinerary as _save_itin
from app.services.agent_run_store import get_agent_run as _get_run, get_trip_agent_runs as _get_trip_runs


class BaseTripRepository(ABC):
    @abstractmethod
    def get(self, trip_id: str) -> Trip | None:
        pass

    @abstractmethod
    def save(self, trip: Trip) -> Trip:
        pass


class BaseItineraryRepository(ABC):
    @abstractmethod
    def get(self, trip_id: str) -> Itinerary | None:
        pass

    @abstractmethod
    def save(self, itinerary: Itinerary) -> Itinerary:
        pass


class BaseAgentRunRepository(ABC):
    @abstractmethod
    def get(self, trip_id: str, run_id: str) -> dict[str, Any] | None:
        pass

    @abstractmethod
    def list_by_trip(self, trip_id: str) -> list[dict[str, Any]]:
        pass


class InMemoryTripRepository(BaseTripRepository):
    def get(self, trip_id: str) -> Trip | None:
        return _get_trip(trip_id)

    def save(self, trip: Trip) -> Trip:
        return _save_trip(trip)


class InMemoryItineraryRepository(BaseItineraryRepository):
    def get(self, trip_id: str) -> Itinerary | None:
        return _get_itin(trip_id)

    def save(self, itinerary: Itinerary) -> Itinerary:
        return _save_itin(itinerary)


class InMemoryAgentRunRepository(BaseAgentRunRepository):
    def get(self, trip_id: str, run_id: str) -> dict[str, Any] | None:
        return _get_run(trip_id, run_id)

    def list_by_trip(self, trip_id: str) -> list[dict[str, Any]]:
        return _get_trip_runs(trip_id)


# Default active repository instances
trip_repo = InMemoryTripRepository()
itinerary_repo = InMemoryItineraryRepository()
agent_run_repo = InMemoryAgentRunRepository()
