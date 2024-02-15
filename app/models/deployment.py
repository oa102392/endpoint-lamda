from typing import Optional

from pydantic import BaseModel

class DeployRequest(BaseModel):
    apps: str
    framework: str
    scenario: str
    user_id: Optional[str] = None
    scale: Optional[str] = None



class DeployResponse(BaseModel):
    SIMULATION_ID: str
    status: str