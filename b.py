import logging
from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from airflow.utils.dates import days_ago
from airflow.www.security import AirflowSecurityManager
from airflow.settings import Session
from airflow.models import DagModel
from flask_appbuilder import AppBuilder
from airflow import settings
from airflow.www.app import create_app

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask app and appbuilder instances
app = create_app()
appbuilder = AppBuilder(app, session=settings.Session, base_template='airflow/main.html', indexview=appbuilder_indexview)

def get_dag_owners():
    session = Session()
    dags = session.query(DagModel).all()
    dag_owners = {}
    for dag in dags:
        owner = dag.owners
        if owner in dag_owners:
            dag_owners[owner].append(dag.dag_id)
        else:
            dag_owners[owner] = [dag.dag_id]
        logger.info(f"Found owner {dag.owners} for DAG {dag.dag_id}")
    session.close()
    return dag_owners

def create_custom_roles():
    dag_owners = get_dag_owners()
    security_manager = AirflowSecurityManager(appbuilder)  # Initialize with appbuilder
    
    for owner, dag_ids in dag_owners.items():
        role_name = f"{owner}_group_access"
        
        # Check if role exists, if not create it
        if not security_manager.find_role(role_name):
            security_manager.create_role(role_name)
            logger.info(f"Created role {role_name}")
        
        # Create permissions for each DAG and assign to the role
        for dag_id in dag_ids:
            read_permission = f"can_read_on_DAG:{dag_id}"
            edit_permission = f"can_edit_on_DAG:{dag_id}"
            delete_permission = f"can_delete_on_DAG:{dag_id}"
            
            # Create permissions if they don't exist
            if not security_manager.find_permission('can_read', dag_id):
                security_manager.create_custom_permission('can_read', 'DAG', dag_id)
                logger.info(f"Created permission {read_permission}")
            if not security_manager.find_permission('can_edit', dag_id):
                security_manager.create_custom_permission('can_edit', 'DAG', dag_id)
                logger.info(f"Created permission {edit_permission}")
            if not security_manager.find_permission('can_delete', dag_id):
                security_manager.create_custom_permission('can_delete', 'DAG', dag_id)
                logger.info(f"Created permission {delete_permission}")
            
            # Assign permissions to the role
            security_manager.add_permission_to_role(role_name, 'can_read', dag_id)
            security_manager.add_permission_to_role(role_name, 'can_edit', dag_id)
            security_manager.add_permission_to_role(role_name, 'can_delete', dag_id)
            logger.info(f"Assigned permissions to role {role_name} for DAG {dag_id}")
        
        # Assign role to the user
        user = security_manager.find_user(owner)
        if user:
            security_manager.add_role_to_user(user, role_name)
            logger.info(f"Assigned role {role_name} to user {owner}")
        else:
            logger.warning(f"User {owner} not found in Airflow users.")

# Define the DAG
default_args = {
    'owner': 'admin',
    'start_date': days_ago(1),
}

dag = DAG(
    'create_custom_roles_dag',
    default_args=default_args,
    description='A DAG to create custom roles based on DAG owners',
    schedule_interval='@daily',  # Schedule to run daily, adjust as needed
)

# Define the task
create_roles_task = PythonOperator(
    task_id='create_custom_roles',
    python_callable=create_custom_roles,
    dag=dag,
)

# Set task dependencies if any
# For this example, there's only one task
create_roles_task
