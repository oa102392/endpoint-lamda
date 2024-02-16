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

class DeployRequest(BaseModel):
    input: str  # Raw JSON string

    @validator('input')
    def validate_input(cls, v):
        try:
            # Attempt to parse the input string into a DeploymentInput model
            DeploymentInput.parse_raw(v)
        except ValidationError as e:
            # If parsing fails, raise a validation error
            raise ValueError(f"Invalid input for DeploymentInput: {e}")
        # If parsing is successful, return the original JSON string
        return v

-------------
from pydantic import BaseModel, validator, ValidationError
from typing import List, Optional
import json

class DeploymentInput(BaseModel):
    apps: List[str]
    framework: str
    scenario: str
    user_id: Optional[str] = None  
    scale: Optional[int] = None  

class DeployRequest(BaseModel):
    input: str  # Raw JSON string
    parsed_input: DeploymentInput = None  # Add this line

    @validator('input', pre=True)
    def validate_and_parse_input(cls, v):
        try:
            # Attempt to parse the input string into a DeploymentInput model
            parsed = DeploymentInput.parse_raw(v)
        except ValidationError as e:
            # If parsing fails, raise a validation error
            raise ValueError(f"Invalid input for DeploymentInput: {e}")
        # If parsing is successful, return the parsed DeploymentInput instance
        return parsed

    @validator('parsed_input', pre=True, always=True)
    def set_parsed_input(cls, v, values):
        if 'input' in values:
            return DeploymentInput.parse_raw(values['input'])
        raise ValueError("Input not provided")
    


    ----



    @router.post("/deploy", response_model=DeployResponse)
async def deploy(request: DeployRequest = Depends(), zip_file: UploadFile = File(...)):
    try:
        # Parse the input JSON string into a DeploymentInput instance
        deployment_input = DeploymentInput.parse_raw(request.input)
    except ValidationError as e:
        # If parsing or validation fails, return an HTTP 422 error
        raise HTTPException(status_code=422, detail=f"Error parsing deployment input: {e.errors()}")

    # Proceed with the deployment using the parsed DeploymentInput instance
    results = await do_deployment(
        apps=deployment_input.apps, 
        framework=deployment_input.framework, 
        scenario=deployment_input.scenario, 
        user_id=deployment_input.user_id, 
        scale=deployment_input.scale, 
        zip_file=zip_file
    )
    simulation_id = results["id"]
    status = results["status"]

    # Return the deployment response
    return {"SIMULATION_ID": simulation_id, "status": status}
----

from fastapi import APIRouter, HTTPException, Depends, File, UploadFile
import json

router = APIRouter()

@router.post("/deploy", response_model=DeployResponse)
async def deploy(input: str = Depends(), zip_file: UploadFile = File(...)):
    try:
        # Parse the input JSON string into a dictionary
        input_data = json.loads(input)
        # Convert the dictionary to a DeployRequest model
        deploy_request = DeployRequest(**input_data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Invalid JSON format in input")
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=f"Validation error: {e.errors()}")

    # Use deploy_request for further processing
    # Example: Extract data from deploy_request
    apps = deploy_request.apps
    framework = deploy_request.framework
    scenario = deploy_request.scenario
    user_id = deploy_request.user_id
    scale = deploy_request.scale

    # Placeholder for your deployment logic
    simulation_id = "example_simulation_id"
    status = "success"

    return DeployResponse(SIMULATION_ID=simulation_id, status=status)



-----------

from fastapi import APIRouter, HTTPException, Depends, File, UploadFile
from app.models.deployment import DeployRequest, DeployResponse
from app.deployment.deploy import do_deployment
import json

router = APIRouter()

@router.post("/deploy", response_model=DeployResponse)
async def deploy(input: str = Depends(), zip_file: UploadFile = File(...)):
    try:
        # Parse the input JSON string into a dictionary
        input_data = json.loads(input)
        # Convert the dictionary to a DeployRequest model
        deploy_request = DeployRequest(**input_data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Invalid JSON format in input")
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=f"Validation error: {e.errors()}")

    # Now that deploy_request is a validated DeployRequest instance, use its data in do_deployment
    try:
        results = await do_deployment(
            apps=deploy_request.apps, 
            framework=deploy_request.framework, 
            scenario=deploy_request.scenario, 
            user_id=deploy_request.user_id, 
            scale=deploy_request.scale, 
            zip_file=zip_file
        )
    except Exception as e:  # Catch specific exceptions related to deployment failures
        raise HTTPException(status_code=500, detail=f"Deployment failed: {str(e)}")

    # Assuming results contains simulation_id and status
    simulation_id = results.get("id")
    status = results.get("status")

    return DeployResponse(SIMULATION_ID=simulation_id, status=status)

