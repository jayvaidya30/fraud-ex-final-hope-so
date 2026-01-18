"""Simple in-memory rate limiting dependency.

Intended for development and basic protection. Replace with a shared store for production.
"""

from __future__ import annotations

import time
from collections import defaultdict, deque
from threading import Lock
from typing import Deque, Dict

from fastapi import HTTPException, Request, status


class RateLimiter:
	def __init__(self, *, max_requests: int, window_seconds: int) -> None:
		self.max_requests = max_requests
		self.window_seconds = window_seconds
		self._lock = Lock()
		self._hits: Dict[str, Deque[float]] = defaultdict(deque)

	def check(self, key: str) -> None:
		now = time.time()
		with self._lock:
			queue = self._hits[key]
			while queue and now - queue[0] > self.window_seconds:
				queue.popleft()
			if len(queue) >= self.max_requests:
				raise HTTPException(
					status_code=status.HTTP_429_TOO_MANY_REQUESTS,
					detail="Rate limit exceeded",
				)
			queue.append(now)


_DEFAULT_LIMITER = RateLimiter(max_requests=60, window_seconds=60)


async def rate_limit(request: Request) -> None:
	client = request.client.host if request.client else "unknown"
	_DEFAULT_LIMITER.check(client)
