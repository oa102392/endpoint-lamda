from fastapi import APIRouter, Depends, File, UploadFile

from app.deployment.deploy import do_deployment
from app.model.deployment import DeployRequest, DeployResponse

router = APIRouter()

# From Manager: There are the tasks that need to be completed before the route is done
#Instead of: Parse CSV of apps into List [str] you should just take two fields, input & file.
# input is going to be a str that you'll JSON parse and convert to a Model. 
# and file is just the file. This actually makes it a little easier

#* Remove print statements (only used for examples)
#* Update 'deploy' to take two primative parameters
# - Create DeployRequest Model
# - Parse CSV list of apps into List[str]
# - DeployRequest can have validation code
# * Delete the Request only and File only examples
# - Along with their unit tests
# * (Optional) Remove Temp File and Magic Mock

# Example with both Request POST body & File upload
# Requires "python-multipart"

@router.post("/deploy", response_model=DeployResponse)
async def deploy(request: DeployRequest = Depends(), zip_file: UploadFile = File(...)):
    print(f'request: {request}')
    print(f'filename: {zip_file.filename}')
    results = await do_deployment()
    simulation_id = results["id"]
    status = results["status"]

    return {"SIMULATION_ID": simulation_id, "status": status}

# POST with only Request Body
@router.post("/request/deploy", response_model=DeployResponse)
async def deploy_request(request: DeployRequest):
    print(f'request:{request}')
    results = await do_deployment()
    simulation_id = results["id"]
    status = results["status"]

    return {"SIMULATION_ID": simulation_id, "status": status}

# POST with only File upload
@router.post("/file/deploy", response_model=DeployResponse)
async def deploy_file(zip_file: UploadFile = File(...)):
    print(f'request:{zip_file.filename}')
    results = await do_deployment()
    simulation_id = results["id"]
    status = results["status"]

    return {"SIMULATION_ID": simulation_id, "status": status}