from pydantic import BaseModel, validator
from search.forms import QueryList
from JARVIS.enums import SERVER_VERSION


class InitialState(BaseModel):
    queries_data: QueryList
    server_version: str = SERVER_VERSION
