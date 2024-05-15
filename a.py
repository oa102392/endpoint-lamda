deploy.py

from typing import list, Optional, Dict 
from app.workflow.datastore import store_one
from app.workfloe.model.workflow_message import WorkflowMessage
from fastapi import UploadFile
from app.processors.get_sim_id import get_sim_id

async def deployment(app: List[str], framework: str, scenario: str, user_id: Optional[str], scale: Optional[int], zip_file: UploadFile) -> Dict[str, str]:

    SIMULATION_ID = get_sim_id()
    workflow_message : WorkflowMessage = WorkflowMessage("Deployment Workflow", "123abc", "initialize", 0, SIMULATION_ID)
    deployment_message = {}
    
    return(response)


workflow_message.py

import faust

class WorkflowMessage(faust.Record, validation=True):
    workflow_type: str
    workflow_id: str
    workflow_step: str
    retry_count: int = 0
    simulation_id: str = "00000000-0000-0000-0000-000000000000"


datastore.py

import logging 
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.results import InsertManyResult, InsertOneResult
from pymongo.server_api import ServerApi

from app import settings

logger = logging.getLogger(__name__)
data_store_uri = ""
mongo_client = {}
mongo_datastore_database = None
mongo_datastore_collection = None

async def initialize():
    if not settings.mongo_enabled:
        return logger.info("Mongo disabled. Skipping data store initialization.")
    
    global data_store_uri
    global mongo_client
    global mongo_datastore_database
    global mongo_datastore_collection
    data_store_uri =(
        f"mongodb://{settings.mongo_username}:{settings.mongo_token}"
        f"@{settings.mongo.host}:{settings.mongo_port}"
    )
    if "pytest" not in sys.modules:
        mongo_client = AsyncIOMotorClient(data_store_uri,
                                          server_api=ServerApi('1'),
                                          serverSelectionTimeoutMS=settings.mongo_server_selection_timeout_ms)
        mongo_datastore_database = mongo_client[settings.mongo_datastore_db]
        mongo_datastore_collection = mongo_datastore_database[settings.mongo_datastore_collection]

        logger.info("MongoDB configuration initialized.")

async def store_one(document):
    result: InsertOneResult = await mongo_datastore_collection.insert_one(document)
    logger.info(f"Document (ID: {result.inserted_id}) inserted.")
    return result.inserted_id

async def store_many(documents):
    results: InsertManyResult = await mongo_datastore_collection.insert_many(documents)
    logger.info(f"Documents (IDs: {results.inserted_id}s) inserted.")
    return results.inserted_ids

async def query_one(filter=None):
    document = await mongo_datastore_collection.find_one(filter=filter)
    return document

async def query(filter=None, projection=None):
    documents = mongo_datastore_collection.find(filter=filter, projection=projection)
    return documents


workflow.py

import asyncio
import sys
import logging

from app.workflow import workflow_app, topic
from app.workflow_engine import process_workflow_message
from app.workflow.model.workflow_message import WorkflowMessage

logger = logging.getLogger(__name__)

async def start():
    if not settings.workflow_enabled:
        return logger.info("Async workflow disabled")
    
    if "pytest" not in sys.modules:
        await asyncio.ensure_future(workflow_app.start(), loop=asyncio.get_event_loop())

        logger.info(f"Worflow app started ({workflow_app.started}): {workflow_app.label}")

async def stop():
    if settings.workflow_enabled:
        await workflow_app.stop()
        logger.info(f"Worflow app stopped ({workflow_app.started}): {workflow_app.label}")

async def send(message: WorkflowMessage):
    results = await topic.send(value=message)
    value = await results
    return {
        'timestamp': value.timestamp,
        'timestamp_type': value.timestamp_type,
        'offset': value.offset,
        'partition': value.partition,
        'topic': value.topic,
        'topic_partition': value.topic_partition,
    }



import pytest
from unittest.mock import AsyncMock
from fastapi import UploadFile
from io import BytesIO

# Assuming your deployment function is in deploy.py
from deploy import deployment

@pytest.mark.asyncio
async def test_deployment():
    # Mocking get_sim_id, send, and store_one
    from app.processors.get_sim_id import get_sim_id
    from app.workflow.workflow import send
    from app.workflow.datastore import store_one

    get_sim_id = AsyncMock(return_value="unique-sim-id")
    send = AsyncMock(return_value={"status": "message sent"})
    store_one = AsyncMock(return_value="mongo-id")

    # Create a mock UploadFile
    file_content = b"dummy data"
    zip_file = UploadFile(filename="test.zip", file=BytesIO(file_content))

    # Call the deployment function
    result = await deployment(
        app=["app1", "app2"],
        framework="test-framework",
        scenario="test-scenario",
        user_id="user123",
        scale=10,
        zip_file=zip_file
    )

    # Asserts to check if the results are as expected
    assert result["simulation_id"] == "unique-sim-id"
    assert result["status"] == "Deployment initiated successfully"
    assert result["workflow_message_sent"]["status"] == "message sent"
    assert result["mongo_store_result"] == "mongo-id"

    # Check if the mocks were called correctly
    send.assert_called_once()
    store_one.assert_called_once()

    # Check the contents of the call to store_one
    stored_document = store_one.call_args[0][0]
    assert stored_document["simulation_id"] == "unique-sim-id"
    assert stored_document["user_id"] == "user123"



import pytest
from unittest.mock import AsyncMock, patch
from fastapi import UploadFile
from io import BytesIO

# Assuming your deployment function is in deploy.py
from deploy import deployment

@pytest.mark.asyncio
async def test_deployment():
    # Patch the necessary functions to avoid actual external calls
    with patch('app.processors.get_sim_id.get_sim_id', new_callable=AsyncMock) as mock_get_sim_id, \
         patch('app.workflow.workflow.send', new_callable=AsyncMock) as mock_send, \
         patch('app.workflow.datastore.store_one', new_callable=AsyncMock) as mock_store_one:
        
        # Setup mocks
        mock_get_sim_id.return_value = "unique-sim-id"
        mock_send.return_value = {"status": "message sent"}
        mock_store_one.return_value = "mongo-id"

        # Create a mock UploadFile
        file_content = b"dummy data"
        zip_file = UploadFile(filename="test.zip", file=BytesIO(file_content))

        # Call the deployment function
        result = await deployment(
            app=["app1", "app2"],
            framework="test-framework",
            scenario="test-scenario",
            user_id="user123",
            scale=10,
            zip_file=zip_file
        )

        # Asserts to check if the results are as expected
        assert result["simulation_id"] == "unique-sim-id"
        assert result["status"] == "Deployment initiated successfully"
        assert result["workflow_message_sent"]["status"] == "message sent"
        assert result["mongo_store_result"] == "mongo-id"

        # Check if the mocks were called correctly
        mock_send.assert_called_once()
        mock_store_one.assert_called_once()

        # Check the contents of the call to store_one
        stored_document = mock_store_one.call_args[0][0]
        assert stored_document["simulation_id"] == "unique-sim-id"
        assert stored_document["user_id"] == "user123"



        # Define the return values for the mocks
        mock_get_sim_id.return_value = "unique-sim-id"
        mock_send.return_value = {
            'timestamp': 123456789,
            'timestamp_type': 'create_time',
            'offset': 0,
            'partition': 1,
            'topic': 'deployment_topic',
            'topic_partition': 'deployment_topic-1'
        }
        mock_store_one.return_value = "mongo-id"



        mock_send.assert_called_once_with(AsyncMock(return_value={
            'timestamp': 123456789,
            'timestamp_type': 'create_time',
            'offset': 0,
            'partition': 1,
            'topic': 'deployment_topic',
            'topic_partition': 'deployment_topic-1'
        }))


@pytest.mark.asyncio
async def test_start_and_stop_enabled(caplog):
    #Mock the faust app

    with patch("app.workflow.get_workflow", return_value=mocked_app):
        settings.workflow_enabled=True
        await workflow.start()



def decode(message_file):
    with open(message_file, 'r') as file:
        lines = file.readlines()
    
    number_word_map = {}
    for line in lines:
        number, word = line.strip().split(' ', 1)
        number_word_map[int(number)] = word
    
   
    current = 1
    i = 1
    pyramid_numbers = []
    while current in number_word_map:
        pyramid_numbers.append(current)
        current += i
        i += 1
    
    message = ' '.join(number_word_map[num] for num in pyramid_numbers)
    
    return message

# Example usage:
filename = 'input.txt'  # Replace 'input.txt' with the path to your actual file
decoded_message = decode_message_file(filename)
print(decoded_message)

