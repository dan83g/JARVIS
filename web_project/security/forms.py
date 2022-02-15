from pydantic import BaseModel


class SettingsModel(BaseModel):
    theme: str = "vela-blue"
    errors: bool = True
