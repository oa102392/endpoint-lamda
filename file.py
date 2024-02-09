from fastapi import UploadFile
from pydantic import BaseModel
from typing import List, Optional, Literal

class DeployRequest(BaseModel):
    apps: List[Literal["cast", "scheduler", "driver", "mafes", "data_recorder", "trackpack"]]
    framework: str
    scenario: str
    zip_file: UploadFile
    user_id: Optional[str] = None
    scale: Optional[int] = None

    model_config = {
        "schema_extra" :{
            "example":[ {
                "apps": ["cast", "driver"],
                "framework": "<framework_name",
                "scenario": "<scenario_name>",
                "user_id": "12345",
                "scale": 10,
                "zip_file": "A file named 'example.zip' (This is a placeholder for documentation purposes. Actual file upload is required.)"
            }
            ]
        }
    }

class DeployResponse(BaseModel):
    SIMULATION_ID: str
    status: str