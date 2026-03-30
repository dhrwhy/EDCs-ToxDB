from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # 数据库
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_DATABASE: str = "mousetoxdb"
    MYSQL_USER: str
    MYSQL_PASSWORD: str

    # 文件路径
    ASSETS_DIR: str = "/data/deseq_assets"
    EXCEL_PATH: str = "/data/source_excel/260320小鼠双端信息新版本.xlsx"
    STATISTICS_DIR: str = "/data/statistics"

    # 子路径部署前缀
    URL_PREFIX: str = ""

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}"
            f"@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"
            f"?charset=utf8mb4"
        )

    class Config:
        env_file = ".env"


settings = Settings()
