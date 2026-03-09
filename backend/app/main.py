import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routers import search, browse, analysis, assets, download, stats

app = FastAPI(title="MouseToxDB API", version="1.0", description="小鼠毒理转录组数据库 API")

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


# 全局异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
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
