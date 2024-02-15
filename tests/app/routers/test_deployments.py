import tempfile
from unittest.mock import patch 

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


#DELETE ME
def test_deploy_request():
    endpoint = '/request/deploy'
    with patch("app.routers.deployment.do_deployment", return_value={"id": "mocked_sim_id_1_request_only", "status": "mocked_status_request_only"}):
        request = {"apps": "cast,scheduler", "framework": "string", "scenario": "string", "user_id":"string", "scale":0}
        response = client.post(endpoint, json=request)

        assert response.status_code == 200
        assert response.json() == {"SIMULATION_ID": "mocked_sim_id_1_request_only", "status": "mocked_status_request_only"}


#DELETE ME
def test_deploy_file():
    endpoint = '/file/deploy'
    with patch("app.routers.deployment.do_deployment", return_value={"id": "mocked_sim_id_1_file_only", "status": "mocked_status_file_only"}):

        # Create a temporary file
        with tempfile.NamedTemporaryFile() as temp_file:
            temp_file.write(b"zip file content")
            temp_file.seek(0)

            files = {'zip_file': (temp_file.name, temp_file)}
            response = client.post(endpoint, files=files)

        assert response.status_code == 200
        assert response.json() == {"SIMULATION_ID": "mocked_sim_id_1_file_only", "status": "mocked_status_file_only"}


def test_deploy():
    endpoint = '/file/deploy'
    with patch("app.routers.deployment.do_deployment", return_value={"id": "mocked_sim_id_1", "status": "mocked_status"}):

        # Create a temporary file
        with tempfile.NamedTemporaryFile() as temp_file:
            temp_file.write(b"zip file content")
            temp_file.seek(0)

            files = {'zip_file': (temp_file.name, temp_file)}
            request = {"apps": "cast,scheduler", "framework": "test framework", "scenario": "test scenario", "user_id":"user id 123", "scale":5}
            response = client.post("deploy", params=request, files=files)

        assert response.status_code == 200
        assert response.json() == {"SIMULATION_ID": "mocked_sim_id_1", "status": "mocked_status"}