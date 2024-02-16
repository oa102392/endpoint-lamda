from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.middleware import process_time
from app.routers import deployment, ping

setings = get_settings()

#Server.
app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    openapi_tags=settings.openapi_tags,
)

#Includes.
app.include_router(ping.router)
app.include_router(deployment.router)
app.add_middleware(process_time.ProcessTimeMiddleware)
app.mount("/", StaticFiles(directory="app/static", html=True), name="static")

input: "{
"apps": "['cast','scheduler','driver','trackpack','mafes','data_recorder']",
"framework":"test",
"scenario":"mwtd"}"


--------------------

model.py----

from typing import List, Optional
from pydantic import BaseModel, validator
import json

class DeploymentInput(BaseModel):
    apps: List[str]
    framework: str
    scenario: str
    user_id: Optional[str] = None  
    scale: Optional[int] = None  

class DeployRequest(BaseModel):
    input: str  # Raw JSON string

    @property
    def parsed_input(self) -> DeploymentInput:
        try:
            input_data = json.loads(self.input)
            # Convert the 'apps' field from a string representation of a list to an actual list
            # Replace single quotes with double quotes for valid JSON
            input_data['apps'] = json.loads(input_data['apps'].replace("'", '"')) 
            return DeploymentInput(**input_data)
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON format in 'input' field")

    @validator('input')
    def validate_input(cls, v):
        # Validate the 'input' field can be parsed into a valid JSON object
        try:
            json.loads(v)
            return v
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON format in 'input' field")

class DeployResponse(BaseModel):
    SIMULATION_ID:str
    status:str



routers/deployments.py---------

from fastapi import APIRouter, Depends, File, UploadFile
from app.models.deployment import DeployRequest, DeployResponse
from app.deployment.deploy import do_deployment

router = APIRouter()

@router.post("/deploy", response_model=DeployResponse)
async def deploy(request: DeployRequest = Depends(), zip_file: UploadFile = File(...)):
    deployment_input = request.parsed_input
    results = await do_deployment(apps=deployment_input.apps, framework=deployment_input.framework, scenario=deployment_input.scenario, user_id=deployment_input.user_id, scale=deployment_input.scale, zip_file=zip_file)
    simulation_id = results["id"]
    status = results["status"]
    return {"SIMULATION_ID": simulation_id, "status": status}


test_deployments.py


from fastapi.testclient import TestClient
from app.main import app  # Update the import path as necessary
import json
import tempfile
from unittest.mock import patch

client = TestClient(app)

def test_deploy():
    endpoint = '/deploy'
    input_data = {
        "apps": json.dumps(['cast', 'scheduler', 'driver', 'trackpack', 'mafes', 'data_recorder']),
        "framework": "test",
        "scenario": "mwtd",
        "user_id": "user123",
        "scale": 5
    }
    request_body = {"input": json.dumps(input_data)}
    
    with patch("app.routers.deployment.do_deployment", return_value={"id": "mocked_sim_id", "status": "mocked_status"}), tempfile.NamedTemporaryFile() as temp_file:
        temp_file.write(b"zip file content")
        temp_file.seek(0)
        files = {'zip_file': (temp_file.name, open(temp_file.name, 'rb'), 'application/octet-stream')}
        response = client.post(endpoint, data=request_body, files=files)

    assert response.status_code == 200
    assert response.json() == {"SIMULATION_ID": "mocked_sim_id", "status": "mocked_status"}


    ----------

    app/deployment/deploy.py

    from typing import List, Optional, Dict
from fastapi import UploadFile

async def do_deployment(apps: List[str], framework: str, scenario: str, user_id: Optional[str], scale: Optional[int], zip_file: UploadFile) -> Dict[str, str]:
    # Placeholder for the actual deployment logic
    # Here you would use apps, framework, scenario, user_id, scale, and the uploaded file as needed
    # For demonstration, we'll just return a mocked deployment ID and status
    deployment_id = "123"  # Example: Generate or determine this based on your actual deployment process
    deployment_status = "success"  # Example: Determine the status of the deployment

    # Example: Log or process the deployment parameters
    print(f"Deploying with apps: {apps}, framework: {framework}, scenario: {scenario}, user_id: {user_id}, scale: {scale}, file: {zip_file.filename}")

    return {"id": deployment_id, "status": deployment_status}


----------------

from typing import List, Optional
from pydantic import BaseModel, validator, ValidationError
import json

class DeploymentInput(BaseModel):
    apps: List[str]
    framework: str
    scenario: str
    user_id: Optional[str] = None  
    scale: Optional[int] = None  

class DeployRequest(BaseModel):
    input: str  # Initially a raw string

    @property
    def parsed_input(self) -> DeploymentInput:
        # Preprocess the input to ensure it's a valid JSON string
        processed_input = self.preprocess_input(self.input)
        try:
            input_data = json.loads(processed_input)
            return DeploymentInput(**input_data)
        except json.JSONDecodeError:
            raise ValueError("Processed input is not valid JSON")

    @staticmethod
    def preprocess_input(raw_input: str) -> str:
        # Attempt to correct common formatting issues to convert to valid JSON
        # For example, replacing single quotes with double quotes
        try:
            # Assuming the input needs to be evaluated as a Python literal
            # This is a security risk if input is not controlled; consider safer alternatives
            processed_input = raw_input.replace("'", '"')
            # Further processing steps can be added here if necessary
            return processed_input
        except Exception as e:
            raise ValueError(f"Error processing input: {str(e)}")

    @validator('input')
    def validate_input(cls, v):
        # Try to preprocess and then load the input to validate it's valid JSON
        processed_input = cls.preprocess_input(v)
        try:
            json.loads(processed_input)
            return v
        except json.JSONDecodeError:
            raise ValueError("Input cannot be processed into valid JSON")

class DeployResponse(BaseModel):
    SIMULATION_ID: str
    status: str
