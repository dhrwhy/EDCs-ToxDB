from pydantic import BaseModel
from typing import Any, Optional


class ApiResponse(BaseModel):
    code: int = 200
    message: str = "success"
    data: Optional[Any] = None


class PaginatedData(BaseModel):
    total: int
    page: int
    page_size: int
    items: list


def success_response(data: Any = None, message: str = "success") -> dict:
    return {"code": 200, "message": message, "data": data}


def error_response(code: int, message: str) -> dict:
    return {"code": code, "message": message, "data": None}
