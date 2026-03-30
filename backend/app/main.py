import os
import logging
from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routers import search, browse, analysis, assets, download, stats

logger = logging.getLogger(__name__)

app = FastAPI(title="EDC-ToxDB API", version="2.0", description="EDC-ToxDB — Endocrine Disrupting Chemicals Toxicogenomics Database API")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(stats.router)
app.include_router(search.router)
app.include_router(browse.router)
app.include_router(analysis.router)
app.include_router(assets.router)
app.include_router(download.router)


# 全局异常处理（仅捕获非 HTTP 异常，HTTPException 由 FastAPI 默认处理）
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        raise exc
    logger.exception("Unhandled exception on %s %s", request.method, request.url)
    return JSONResponse(
        status_code=500,
        content={
            "code": 500,
            "message": "服务器内部错误",
            "data": None,
        },
    )


# 静态文件挂载（开发环境下由后端提供，生产环境由 Nginx 提供）
if os.path.isdir(settings.ASSETS_DIR):
    app.mount(
        "/static/assets",
        StaticFiles(directory=settings.ASSETS_DIR),
        name="assets",
    )
if os.path.isdir(settings.STATISTICS_DIR):
    app.mount(
        "/static/statistics",
        StaticFiles(directory=settings.STATISTICS_DIR),
        name="statistics",
    )


@app.get("/api/health", tags=["健康检查"])
def health_check():
    return {"code": 200, "message": "ok", "data": None}
