from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Any

T = TypeVar("T")

class BaseRepository(ABC, Generic[T]):
    @abstractmethod
    async def get(self, id: Any) -> T | None:
        pass

    @abstractmethod
    async def list(self, filters: dict[str, Any] | None = None) -> list[T]:
        pass

    @abstractmethod
    async def create(self, obj_in: Any) -> T:
        pass

    @abstractmethod
    async def update(self, id: Any, obj_in: Any) -> T:
        pass

    @abstractmethod
    async def delete(self, id: Any) -> bool:
        pass
