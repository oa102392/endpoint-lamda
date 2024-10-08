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






---------------


   import logging
    from airflow import settings
    from airflow.models import DagModel
    from airflow.www.security import AirflowSecurityManager
    from flask_appbuilder import AppBuilder
    from airflow.www.app import create_app

    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    def get_dag_owners():
        session = settings.Session()
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
        app = create_app()
        appbuilder = AppBuilder(app, session=settings.Session)
        security_manager = AirflowSecurityManager(appbuilder)

        dag_owners = get_dag_owners()
        
        for owner, dag_ids in dag_owners.items():
            role_name = f"{owner}_group_access"
            
            if not security_manager.find_role(role_name):
                security_manager.create_role(role_name)
                logger.info(f"Created role {role_name}")
            
            for dag_id in dag_ids:
                read_permission = f"can_read_on_DAG:{dag_id}"
                edit_permission = f"can_edit_on_DAG:{dag_id}"
                delete_permission = f"can_delete_on_DAG:{dag_id}"
                
                if not security_manager.find_permission('can_read', dag_id):
                    security_manager.create_custom_permission('can_read', 'DAG', dag_id)
                    logger.info(f"Created permission {read_permission}")
                if not security_manager.find_permission('can_edit', dag_id):
                    security_manager.create_custom_permission('can_edit', 'DAG', dag_id)
                    logger.info(f"Created permission {edit_permission}")
                if not security_manager.find_permission('can_delete', dag_id):
                    security_manager.create_custom_permission('can_delete', 'DAG', dag_id)
                    logger.info(f"Created permission {delete_permission}")
                
                security_manager.add_permission_to_role(role_name, 'can_read', dag_id)
                security_manager.add_permission_to_role(role_name, 'can_edit', dag_id)
                security_manager.add_permission_to_role(role_name, 'can_delete', dag_id)
                logger.info(f"Assigned permissions to role {role_name} for DAG {dag_id}")
            
            user = security_manager.find_user(owner)
            if user:
                security_manager.add_role_to_user(user, role_name)
                logger.info(f"Assigned role {role_name} to user {owner}")
            else:
                logger.warning(f"User {owner} not found in Airflow users.")

    if __name__ == "__main__":
        create_custom_roles()





-------//////////


import logging
from airflow import settings
from airflow.models import DagModel
from airflow.www.security import AirflowSecurityManager
from flask_appbuilder import AppBuilder
from airflow.www.app import create_app

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_dag_owners():
    session = settings.Session()
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
    app = create_app()
    appbuilder = AppBuilder(app, session=settings.Session)
    security_manager = AirflowSecurityManager(appbuilder)

    dag_owners = get_dag_owners()
    
    for owner, dag_ids in dag_owners.items():
        role_name = f"{owner}_group_access"
        
        # Check if role exists, if not create it
        role = security_manager.find_role(role_name)
        if not role:
            role = security_manager.create_role(role_name)
            logger.info(f"Created role {role_name}")
        
        # Create permissions for each DAG and assign to the role
        for dag_id in dag_ids:
            read_permission = f"can_read_on_DAG:{dag_id}"
            edit_permission = f"can_edit_on_DAG:{dag_id}"
            delete_permission = f"can_delete_on_DAG:{dag_id}"
            
            # Create permissions if they don't exist
            if not security_manager.find_permission_view_menu('can_read', f'DAG:{dag_id}'):
                security_manager.create_permission('can_read', f'DAG:{dag_id}')
                logger.info(f"Created permission {read_permission}")
            if not security_manager.find_permission_view_menu('can_edit', f'DAG:{dag_id}'):
                security_manager.create_permission('can_edit', f'DAG:{dag_id}')
                logger.info(f"Created permission {edit_permission}")
            if not security_manager.find_permission_view_menu('can_delete', f'DAG:{dag_id}'):
                security_manager.create_permission('can_delete', f'DAG:{dag_id}')
                logger.info(f"Created permission {delete_permission}")
            
            # Assign permissions to the role
            security_manager.add_permission_role(role, read_permission)
            security_manager.add_permission_role(role, edit_permission)
            security_manager.add_permission_role(role, delete_permission)
            logger.info(f"Assigned permissions to role {role_name} for DAG {dag_id}")
        
        # Assign role to the user
        user = security_manager.find_user(username=owner)
        if user:
            security_manager.add_role(user, role)
            logger.info(f"Assigned role {role_name} to user {owner}")
        else:
            logger.warning(f"User {owner} not found in Airflow users.")

if __name__ == "__main__":
    create_custom_roles()




//////////////


import logging
from airflow import settings
from airflow.models import DagModel
from airflow.www.security import AirflowSecurityManager
from flask_appbuilder import AppBuilder
from airflow.www.app import create_app
from sqlalchemy.ext.declarative import declarative_base

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base = declarative_base()

def get_dag_owners():
    session = settings.Session()
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
    app = create_app()
    appbuilder = AppBuilder(app, session=settings.Session)
    security_manager = AirflowSecurityManager(appbuilder)

    dag_owners = get_dag_owners()
    
    for owner, dag_ids in dag_owners.items():
        role_name = f"{owner}_group_access"
        
        # Check if role exists, if not create it
        role = security_manager.find_role(role_name)
        if not role:
            role = security_manager.create_role(role_name)
            logger.info(f"Created role {role_name}")
        
        # Create permissions for each DAG and assign to the role
        for dag_id in dag_ids:
            read_permission = f"can_read_on_DAG:{dag_id}"
            edit_permission = f"can_edit_on_DAG:{dag_id}"
            delete_permission = f"can_delete_on_DAG:{dag_id}"
            
            # Create permissions if they don't exist
            if not security_manager.find_permission_view_menu('can_read', f'DAG:{dag_id}'):
                security_manager.create_permission('can_read', f'DAG:{dag_id}')
                logger.info(f"Created permission {read_permission}")
            if not security_manager.find_permission_view_menu('can_edit', f'DAG:{dag_id}'):
                security_manager.create_permission('can_edit', f'DAG:{dag_id}')
                logger.info(f"Created permission {edit_permission}")
            if not security_manager.find_permission_view_menu('can_delete', f'DAG:{dag_id}'):
                security_manager.create_permission('can_delete', f'DAG:{dag_id}')
                logger.info(f"Created permission {delete_permission}")
            
            # Assign permissions to the role
            security_manager.add_permission_role(role, read_permission)
            security_manager.add_permission_role(role, edit_permission)
            security_manager.add_permission_role(role, delete_permission)
            logger.info(f"Assigned permissions to role {role_name} for DAG {dag_id}")
        
        # Assign role to the user
        user = security_manager.find_user(username=owner)
        if user:
            security_manager.add_role(user, role)
            logger.info(f"Assigned role {role_name} to user {owner}")
        else:
            logger.warning(f"User {owner} not found in Airflow users.")

if __name__ == "__main__":
    create_custom_roles()



]]]]]]]]]]]]]]]]]]]]]



import logging
from airflow import settings
from airflow.models import DagModel
from airflow.www.security import AirflowSecurityManager
from flask_appbuilder import AppBuilder
from airflow.www.app import create_app
from sqlalchemy import Table, MetaData, Column
from airflow.www.fab_security.sqla.models import User  # Ensure correct import

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_dag_owners():
    session = settings.Session()
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
    app = create_app()
    appbuilder = AppBuilder(app, session=settings.Session)
    security_manager = AirflowSecurityManager(appbuilder)
    
    # Proper metadata management
    metadata = MetaData(bind=appbuilder.get_session().bind)
    Table(
        'ab_permission_view_role', metadata,
        Column('id', primary_key=True),
        extend_existing=True  # Ensure the existing table definition is extended
    )
    
    dag_owners = get_dag_owners()
    
    for owner, dag_ids in dag_owners.items():
        role_name = f"{owner}_group_access"
        
        # Check if role exists, if not create it
        role = security_manager.find_role(role_name)
        if not role:
            role = security_manager.create_role(role_name)
            logger.info(f"Created role {role_name}")
        
        # Create permissions for each DAG and assign to the role
        for dag_id in dag_ids:
            read_permission = f"can_read_on_DAG:{dag_id}"
            edit_permission = f"can_edit_on_DAG:{dag_id}"
            delete_permission = f"can_delete_on_DAG:{dag_id}"
            
            # Create permissions if they don't exist
            if not security_manager.find_permission_view_menu('can_read', f'DAG:{dag_id}'):
                security_manager.create_permission('can_read', f'DAG:{dag_id}')
                logger.info(f"Created permission {read_permission}")
            if not security_manager.find_permission_view_menu('can_edit', f'DAG:{dag_id}'):
                security_manager.create_permission('can_edit', f'DAG:{dag_id}')
                logger.info(f"Created permission {edit_permission}")
            if not security_manager.find_permission_view_menu('can_delete', f'DAG:{dag_id}'):
                security_manager.create_permission('can_delete', f'DAG:{dag_id}')
                logger.info(f"Created permission {delete_permission}")
            
            # Assign permissions to the role
            permission_view_read = security_manager.find_permission_view_menu('can_read', f'DAG:{dag_id}')
            permission_view_edit = security_manager.find_permission_view_menu('can_edit', f'DAG:{dag_id}')
            permission_view_delete = security_manager.find_permission_view_menu('can_delete', f'DAG:{dag_id}')
            
            if permission_view_read not in role.permissions:
                security_manager.add_permission_role(role, permission_view_read)
            if permission_view_edit not in role.permissions:
                security_manager.add_permission_role(role, permission_view_edit)
            if permission_view_delete not in role.permissions:
                security_manager.add_permission_role(role, permission_view_delete)
            
            logger.info(f"Assigned permissions to role {role_name} for DAG {dag_id}")
        
        # Assign role to the user
        user = security_manager.find_user(username=owner)
        if user:
            security_manager.add_role(user, role)
            logger.info(f"Assigned role {role_name} to user {owner}")
        else:
            logger.warning(f"User {owner} not found in Airflow users.")

if __name__ == "__main__":
    create_custom_roles()



++++++++++++++++++++++++


import logging
from airflow import settings
from airflow.models import DagModel
from airflow.www.security import AirflowSecurityManager
from flask_appbuilder import AppBuilder
from airflow.www.app import create_app
from sqlalchemy import Table, MetaData, Column

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_dag_owners():
    session = settings.Session()
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
    app = create_app()
    appbuilder = AppBuilder(app, session=settings.Session)
    security_manager = AirflowSecurityManager(appbuilder)
    
    dag_owners = get_dag_owners()
    
    for owner, dag_ids in dag_owners.items():
        role_name = f"{owner}_group_access"
        
        # Check if role exists, if not create it
        role = security_manager.find_role(role_name)
        if not role:
            role = security_manager.create_role(role_name)
            logger.info(f"Created role {role_name}")
        
        # Create permissions for each DAG and assign to the role
        for dag_id in dag_ids:
            read_permission = f"can_read_on_DAG:{dag_id}"
            edit_permission = f"can_edit_on_DAG:{dag_id}"
            delete_permission = f"can_delete_on_DAG:{dag_id}"
            
            # Create permissions if they don't exist
            if not security_manager.find_permission_view_menu('can_read', f'DAG:{dag_id}'):
                security_manager.create_permission('can_read', f'DAG:{dag_id}')
                logger.info(f"Created permission {read_permission}")
            if not security_manager.find_permission_view_menu('can_edit', f'DAG:{dag_id}'):
                security_manager.create_permission('can_edit', f'DAG:{dag_id}')
                logger.info(f"Created permission {edit_permission}")
            if not security_manager.find_permission_view_menu('can_delete', f'DAG:{dag_id}'):
                security_manager.create_permission('can_delete', f'DAG:{dag_id}')
                logger.info(f"Created permission {delete_permission}")
            
            # Assign permissions to the role
            permission_view_read = security_manager.find_permission_view_menu('can_read', f'DAG:{dag_id}')
            permission_view_edit = security_manager.find_permission_view_menu('can_edit', f'DAG:{dag_id}')
            permission_view_delete = security_manager.find_permission_view_menu('can_delete', f'DAG:{dag_id}')
            
            if permission_view_read not in role.permissions:
                security_manager.add_permission_role(role, permission_view_read)
            if permission_view_edit not in role.permissions:
                security_manager.add_permission_role(role, permission_view_edit)
            if permission_view_delete not in role.permissions:
                security_manager.add_permission_role(role, permission_view_delete)
            
            logger.info(f"Assigned permissions to role {role_name} for DAG {dag_id}")
        
        # Assign role to the user
        user = security_manager.find_user(username=owner)
        if user:
            security_manager.add_role(user, role)
            logger.info(f"Assigned role {role_name} to user {owner}")
        else:
            logger.warning(f"User {owner} not found in Airflow users.")

if __name__ == "__main__":
    create_custom_roles()


/////////////


import logging
from airflow import settings
from airflow.models import DagModel
from airflow.www.security import AirflowSecurityManager
from flask_appbuilder import AppBuilder
from airflow.www.app import create_app

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_dag_owners():
    logger.debug("Starting to get DAG owners")
    session = settings.Session()
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
    logger.debug(f"Completed getting DAG owners: {dag_owners}")
    return dag_owners

def create_custom_roles():
    logger.debug("Starting to create custom roles")
    app = create_app()
    appbuilder = AppBuilder(app, session=settings.Session)
    security_manager = AirflowSecurityManager(appbuilder)
    
    dag_owners = get_dag_owners()
    
    for owner, dag_ids in dag_owners.items():
        role_name = f"{owner}_group_access"
        logger.debug(f"Processing owner: {owner} with role: {role_name}")
        
        # Check if role exists, if not create it
        role = security_manager.find_role(role_name)
        if not role:
            role = security_manager.create_role(role_name)
            logger.info(f"Created role {role_name}")
        else:
            logger.info(f"Role {role_name} already exists")
        
        # Create permissions for each DAG and assign to the role
        for dag_id in dag_ids:
            read_permission = f"can_read_on_DAG:{dag_id}"
            edit_permission = f"can_edit_on_DAG:{dag_id}"
            delete_permission = f"can_delete_on_DAG:{dag_id}"
            
            # Create permissions if they don't exist
            logger.debug(f"Processing DAG: {dag_id} for owner: {owner}")
            if not security_manager.find_permission_view_menu('can_read', f'DAG:{dag_id}'):
                security_manager.create_permission('can_read', f'DAG:{dag_id}')
                logger.info(f"Created permission {read_permission}")
            else:
                logger.info(f"Permission {read_permission} already exists")
            if not security_manager.find_permission_view_menu('can_edit', f'DAG:{dag_id}'):
                security_manager.create_permission('can_edit', f'DAG:{dag_id}')
                logger.info(f"Created permission {edit_permission}")
            else:
                logger.info(f"Permission {edit_permission} already exists")
            if not security_manager.find_permission_view_menu('can_delete', f'DAG:{dag_id}'):
                security_manager.create_permission('can_delete', f'DAG:{dag_id}')
                logger.info(f"Created permission {delete_permission}")
            else:
                logger.info(f"Permission {delete_permission} already exists")
            
            # Assign permissions to the role
            permission_view_read = security_manager.find_permission_view_menu('can_read', f'DAG:{dag_id}')
            permission_view_edit = security_manager.find_permission_view_menu('can_edit', f'DAG:{dag_id}')
            permission_view_delete = security_manager.find_permission_view_menu('can_delete', f'DAG:{dag_id}')
            
            if permission_view_read not in role.permissions:
                security_manager.add_permission_role(role, permission_view_read)
                logger.info(f"Assigned read permission to role {role_name} for DAG {dag_id}")
            if permission_view_edit not in role.permissions:
                security_manager.add_permission_role(role, permission_view_edit)
                logger.info(f"Assigned edit permission to role {role_name} for DAG {dag_id}")
            if permission_view_delete not in role.permissions:
                security_manager.add_permission_role(role, permission_view_delete)
                logger.info(f"Assigned delete permission to role {role_name} for DAG {dag_id}")
        
        # Assign role to the user
        user = security_manager.find_user(username=owner)
        if user:
            security_manager.add_role(user, role)
            logger.info(f"Assigned role {role_name} to user {owner}")
        else:
            logger.warning(f"User {owner} not found in Airflow users.")
    
    logger.debug("Completed creating custom roles")

if __name__ == "__main__":
    logger.debug("Script execution started")
    create_custom_roles()
    logger.debug("Script execution finished")


------------------


import logging
from airflow import settings
from airflow.models import DagModel
from airflow.www.security import AirflowSecurityManager
from flask_appbuilder import AppBuilder
from airflow.www.app import create_app

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_dag_owners():
    logger.debug("Starting to get DAG owners")
    session = settings.Session()
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
    logger.debug(f"Completed getting DAG owners: {dag_owners}")
    return dag_owners

def create_custom_roles():
    logger.debug("Starting to create custom roles")
    try:
        app = create_app()
        logger.debug("App created successfully")
    except Exception as e:
        logger.error(f"Error creating app: {e}")
        return
    
    try:
        appbuilder = AppBuilder(app, session=settings.Session)
        logger.debug("AppBuilder created successfully")
    except Exception as e:
        logger.error(f"Error creating AppBuilder: {e}")
        return
    
    try:
        security_manager = AirflowSecurityManager(appbuilder)
        logger.debug("AirflowSecurityManager created successfully")
    except Exception as e:
        logger.error(f"Error creating AirflowSecurityManager: {e}")
        return
    
    dag_owners = get_dag_owners()
    
    for owner, dag_ids in dag_owners.items():
        role_name = f"{owner}_group_access"
        logger.debug(f"Processing owner: {owner} with role: {role_name}")
        
        # Check if role exists, if not create it
        try:
            role = security_manager.find_role(role_name)
            if not role:
                role = security_manager.create_role(role_name)
                logger.info(f"Created role {role_name}")
            else:
                logger.info(f"Role {role_name} already exists")
        except Exception as e:
            logger.error(f"Error handling role {role_name}: {e}")
            continue
        
        # Create permissions for each DAG and assign to the role
        for dag_id in dag_ids:
            read_permission = f"can_read_on_DAG:{dag_id}"
            edit_permission = f"can_edit_on_DAG:{dag_id}"
            delete_permission = f"can_delete_on_DAG:{dag_id}"
            
            # Create permissions if they don't exist
            logger.debug(f"Processing DAG: {dag_id} for owner: {owner}")
            try:
                if not security_manager.find_permission_view_menu('can_read', f'DAG:{dag_id}'):
                    security_manager.create_permission('can_read', f'DAG:{dag_id}')
                    logger.info(f"Created permission {read_permission}")
                else:
                    logger.info(f"Permission {read_permission} already exists")
                if not security_manager.find_permission_view_menu('can_edit', f'DAG:{dag_id}'):
                    security_manager.create_permission('can_edit', f'DAG:{dag_id}')
                    logger.info(f"Created permission {edit_permission}")
                else:
                    logger.info(f"Permission {edit_permission} already exists")
                if not security_manager.find_permission_view_menu('can_delete', f'DAG:{dag_id}'):
                    security_manager.create_permission('can_delete', f'DAG:{dag_id}')
                    logger.info(f"Created permission {delete_permission}")
                else:
                    logger.info(f"Permission {delete_permission} already exists")
            except Exception as e:
                logger.error(f"Error handling permissions for DAG {dag_id}: {e}")
                continue
            
            # Assign permissions to the role
            try:
                permission_view_read = security_manager.find_permission_view_menu('can_read', f'DAG:{dag_id}')
                permission_view_edit = security_manager.find_permission_view_menu('can_edit', f'DAG:{dag_id}')
                permission_view_delete = security_manager.find_permission_view_menu('can_delete', f'DAG:{dag_id}')
                
                if permission_view_read not in role.permissions:
                    security_manager.add_permission_role(role, permission_view_read)
                    logger.info(f"Assigned read permission to role {role_name} for DAG {dag_id}")
                if permission_view_edit not in role.permissions:
                    security_manager.add_permission_role(role, permission_view_edit)
                    logger.info(f"Assigned edit permission to role {role_name} for DAG {dag_id}")
                if permission_view_delete not in role.permissions:
                    security_manager.add_permission_role(role, permission_view_delete)
                    logger.info(f"Assigned delete permission to role {role_name} for DAG {dag_id}")
            except Exception as e:
                logger.error(f"Error assigning permissions to role {role_name} for DAG {dag_id}: {e}")
                continue
        
        # Assign role to the user
        try:
            user = security_manager.find_user(username=owner)
            if user:
                security_manager.add_role(user, role)
                logger.info(f"Assigned role {role_name} to user {owner}")
            else:
                logger.warning(f"User {owner} not found in Airflow users.")
        except Exception as e:
            logger.error(f"Error assigning role {role_name} to user {owner}: {e}")
    
    logger.debug("Completed creating custom roles")

if __name__ == "__main__":
    logger.debug("Script execution started")
    create_custom_roles()
    logger.debug("Script execution finished")


-----------------------//-----------\\



import logging
from airflow import settings
from airflow.models import DagModel
from airflow.www.security import AirflowSecurityManager
from flask_appbuilder import AppBuilder
from airflow.www.app import create_app
from sqlalchemy import Table, MetaData, Column, Integer

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_dag_owners():
    logger.debug("Starting to get DAG owners")
    session = settings.Session()
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
    logger.debug(f"Completed getting DAG owners: {dag_owners}")
    return dag_owners

def create_custom_roles():
    logger.debug("Starting to create custom roles")
    try:
        app = create_app()
        logger.debug("App created successfully")
    except Exception as e:
        logger.error(f"Error creating app: {e}")
        return
    
    try:
        metadata = MetaData(bind=settings.engine)
        Table(
            'ab_permission_view_role', metadata,
            Column('id', Integer, primary_key=True),
            extend_existing=True
        )
        logger.debug("Table extended successfully")
        
        appbuilder = AppBuilder(app, session=settings.Session)
        logger.debug("AppBuilder created successfully")
    except Exception as e:
        logger.error(f"Error creating AppBuilder: {e}")
        return
    
    try:
        security_manager = AirflowSecurityManager(appbuilder)
        logger.debug("AirflowSecurityManager created successfully")
    except Exception as e:
        logger.error(f"Error creating AirflowSecurityManager: {e}")
        return
    
    dag_owners = get_dag_owners()
    
    for owner, dag_ids in dag_owners.items():
        role_name = f"{owner}_group_access"
        logger.debug(f"Processing owner: {owner} with role: {role_name}")
        
        # Check if role exists, if not create it
        try:
            role = security_manager.find_role(role_name)
            if not role:
                role = security_manager.create_role(role_name)
                logger.info(f"Created role {role_name}")
            else:
                logger.info(f"Role {role_name} already exists")
        except Exception as e:
            logger.error(f"Error handling role {role_name}: {e}")
            continue
        
        # Create permissions for each DAG and assign to the role
        for dag_id in dag_ids:
            read_permission = f"can_read_on_DAG:{dag_id}"
            edit_permission = f"can_edit_on_DAG:{dag_id}"
            delete_permission = f"can_delete_on_DAG:{dag_id}"
            
            # Create permissions if they don't exist
            logger.debug(f"Processing DAG: {dag_id} for owner: {owner}")
            try:
                if not security_manager.find_permission_view_menu('can_read', f'DAG:{dag_id}'):
                    security_manager.create_permission('can_read', f'DAG:{dag_id}')
                    logger.info(f"Created permission {read_permission}")
                else:
                    logger.info(f"Permission {read_permission} already exists")
                if not security_manager.find_permission_view_menu('can_edit', f'DAG:{dag_id}'):
                    security_manager.create_permission('can_edit', f'DAG:{dag_id}')
                    logger.info(f"Created permission {edit_permission}")
                else:
                    logger.info(f"Permission {edit_permission} already exists")
                if not security_manager.find_permission_view_menu('can_delete', f'DAG:{dag_id}'):
                    security_manager.create_permission('can_delete', f'DAG:{dag_id}')
                    logger.info(f"Created permission {delete_permission}")
                else:
                    logger.info(f"Permission {delete_permission} already exists")
            except Exception as e:
                logger.error(f"Error handling permissions for DAG {dag_id}: {e}")
                continue
            
            # Assign permissions to the role
            try:
                permission_view_read = security_manager.find_permission_view_menu('can_read', f'DAG:{dag_id}')
                permission_view_edit = security_manager.find_permission_view_menu('can_edit', f'DAG:{dag_id}')
                permission_view_delete = security_manager.find_permission_view_menu('can_delete', f'DAG:{dag_id}')
                
                if permission_view_read not in role.permissions:
                    security_manager.add_permission_role(role, permission_view_read)
                    logger.info(f"Assigned read permission to role {role_name} for DAG {dag_id}")
                if permission_view_edit not in role.permissions:
                    security_manager.add_permission_role(role, permission_view_edit)
                    logger.info(f"Assigned edit permission to role {role_name} for DAG {dag_id}")
                if permission_view_delete not in role.permissions:
                    security_manager.add_permission_role(role, permission_view_delete)
                    logger.info(f"Assigned delete permission to role {role_name} for DAG {dag_id}")
            except Exception as e:
                logger.error(f"Error assigning permissions to role {role_name} for DAG {dag_id}: {e}")
                continue
        
        # Assign role to the user
        try:
            user = security_manager.find_user(username=owner)
            if user:
                security_manager.add_role(user, role)
                logger.info(f"Assigned role {role_name} to user {owner}")
            else:
                logger.warning(f"User {owner} not found in Airflow users.")
        except Exception as e:
            logger.error(f"Error assigning role {role_name} to user {owner}: {e}")
    
    logger.debug("Completed creating custom roles")

if __name__ == "__main__":
    logger.debug("Script execution started")
    create_custom_roles()
    logger.debug("Script execution finished")


----------------------


import logging
from airflow import settings
from airflow.models import DagModel
from airflow.www.security import AirflowSecurityManager
from flask_appbuilder import AppBuilder
from airflow.www.app import create_app

# Correct import for Airflow 2.7.0+
try:
    from airflow.auth.managers.fab.models import User, Role
except ImportError:
    from flask_appbuilder.security.sqla.models import User, Role

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_dag_owners():
    logger.debug("Starting to get DAG owners")
    session = settings.Session()
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
    logger.debug(f"Completed getting DAG owners: {dag_owners}")
    return dag_owners

def create_custom_roles():
    logger.debug("Starting to create custom roles")
    try:
        app = create_app()
        logger.debug("App created successfully")
    except Exception as e:
        logger.error(f"Error creating app: {e}")
        return
    
    try:
        appbuilder = AppBuilder(app, session=settings.Session)
        logger.debug("AppBuilder created successfully")
    except Exception as e:
        logger.error(f"Error creating AppBuilder: {e}")
        return
    
    try:
        security_manager = AirflowSecurityManager(appbuilder)
        logger.debug("AirflowSecurityManager created successfully")
    except Exception as e:
        logger.error(f"Error creating AirflowSecurityManager: {e}")
        return
    
    dag_owners = get_dag_owners()
    
    for owner, dag_ids in dag_owners.items():
        role_name = f"{owner}_group_access"
        logger.debug(f"Processing owner: {owner} with role: {role_name}")
        
        # Check if role exists, if not create it
        try:
            role = security_manager.find_role(role_name)
            if not role:
                role = security_manager.create_role(role_name)
                logger.info(f"Created role {role_name}")
            else:
                logger.info(f"Role {role_name} already exists")
        except Exception as e:
            logger.error(f"Error handling role {role_name}: {e}")
            continue
        
        # Create permissions for each DAG and assign to the role
        for dag_id in dag_ids:
            read_permission = f"can_read_on_DAG:{dag_id}"
            edit_permission = f"can_edit_on_DAG:{dag_id}"
            delete_permission = f"can_delete_on_DAG:{dag_id}"
            
            # Create permissions if they don't exist
            logger.debug(f"Processing DAG: {dag_id} for owner: {owner}")
            try:
                if not security_manager.find_permission_view_menu('can_read', f'DAG:{dag_id}'):
                    security_manager.create_permission('can_read', f'DAG:{dag_id}')
                    logger.info(f"Created permission {read_permission}")
                else:
                    logger.info(f"Permission {read_permission} already exists")
                if not security_manager.find_permission_view_menu('can_edit', f'DAG:{dag_id}'):
                    security_manager.create_permission('can_edit', f'DAG:{dag_id}')
                    logger.info(f"Created permission {edit_permission}")
                else:
                    logger.info(f"Permission {edit_permission} already exists")
                if not security_manager.find_permission_view_menu('can_delete', f'DAG:{dag_id}'):
                    security_manager.create_permission('can_delete', f'DAG:{dag_id}')
                    logger.info(f"Created permission {delete_permission}")
                else:
                    logger.info(f"Permission {delete_permission} already exists")
            except Exception as e:
                logger.error(f"Error handling permissions for DAG {dag_id}: {e}")
                continue
            
            # Assign permissions to the role
            try:
                permission_view_read = security_manager.find_permission_view_menu('can_read', f'DAG:{dag_id}')
                permission_view_edit = security_manager.find_permission_view_menu('can_edit', f'DAG:{dag_id}')
                permission_view_delete = security_manager.find_permission_view_menu('can_delete', f'DAG:{dag_id}')
                
                if permission_view_read not in role.permissions:
                    security_manager.add_permission_role(role, permission_view_read)
                    logger.info(f"Assigned read permission to role {role_name} for DAG {dag_id}")
                if permission_view_edit not in role.permissions:
                    security_manager.add_permission_role(role, permission_view_edit)
                    logger.info(f"Assigned edit permission to role {role_name} for DAG {dag_id}")
                if permission_view_delete not in role.permissions:
                    security_manager.add_permission_role(role, permission_view_delete)
                    logger.info(f"Assigned delete permission to role {role_name} for DAG {dag_id}")
            except Exception as e:
                logger.error(f"Error assigning permissions to role {role_name} for DAG {dag_id}: {e}")
                continue
        
        # Assign role to the user
        try:
            user = security_manager.find_user(username=owner)
            if user:
                security_manager.add_role(user, role)
                logger.info(f"Assigned role {role_name} to user {owner}")
            else:
                logger.warning(f"User {owner} not found in Airflow users.")
        except Exception as e:
            logger.error(f"Error assigning role {role_name} to user {owner}: {e}")
    
    logger.debug("Completed creating custom roles")

if __name__ == "__main__":
    logger.debug("Script execution started")
    create_custom_roles()
    logger.debug("Script execution finished")


--------------


import logging
from airflow import settings
from airflow.models import DagModel
from airflow.www.security import AirflowSecurityManager
from flask_appbuilder import AppBuilder
from airflow.www.app import create_app

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_dag_owners():
    logger.debug("Starting to get DAG owners")
    session = settings.Session()
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
    logger.debug(f"Completed getting DAG owners: {dag_owners}")
    return dag_owners

def create_custom_roles():
    logger.debug("Starting to create custom roles")
    try:
        app = create_app()
        logger.debug("App created successfully")
    except Exception as e:
        logger.error(f"Error creating app: {e}")
        return
    
    try:
        appbuilder = AppBuilder(app, session=settings.Session)
        logger.debug("AppBuilder created successfully")
    except Exception as e:
        logger.error(f"Error creating AppBuilder: {e}")
        return
    
    try:
        security_manager = AirflowSecurityManager(appbuilder)
        logger.debug("AirflowSecurityManager created successfully")
    except Exception as e:
        logger.error(f"Error creating AirflowSecurityManager: {e}")
        return
    
    dag_owners = get_dag_owners()
    
    for owner, dag_ids in dag_owners.items():
        role_name = f"{owner}_group_access"
        logger.debug(f"Processing owner: {owner} with role: {role_name}")
        
        # Check if role exists, if not create it
        try:
            role = security_manager.find_role(role_name)
            if not role:
                role = security_manager.create_role(role_name)
                logger.info(f"Created role {role_name}")
            else:
                logger.info(f"Role {role_name} already exists")
        except Exception as e:
            logger.error(f"Error handling role {role_name}: {e}")
            continue
        
        # Create permissions for each DAG and assign to the role
        for dag_id in dag_ids:
            read_permission = f"can_read_on_DAG:{dag_id}"
            edit_permission = f"can_edit_on_DAG:{dag_id}"
            delete_permission = f"can_delete_on_DAG:{dag_id}"
            
            # Create permissions if they don't exist
            logger.debug(f"Processing DAG: {dag_id} for owner: {owner}")
            try:
                if not security_manager.find_permission_view_menu('can_read', f'DAG:{dag_id}'):
                    security_manager.create_permission('can_read', f'DAG:{dag_id}')
                    logger.info(f"Created permission {read_permission}")
                else:
                    logger.info(f"Permission {read_permission} already exists")
                if not security_manager.find_permission_view_menu('can_edit', f'DAG:{dag_id}'):
                    security_manager.create_permission('can_edit', f'DAG:{dag_id}')
                    logger.info(f"Created permission {edit_permission}")
                else:
                    logger.info(f"Permission {edit_permission} already exists")
                if not security_manager.find_permission_view_menu('can_delete', f'DAG:{dag_id}'):
                    security_manager.create_permission('can_delete', f'DAG:{dag_id}')
                    logger.info(f"Created permission {delete_permission}")
                else:
                    logger.info(f"Permission {delete_permission} already exists")
            except Exception as e:
                logger.error(f"Error handling permissions for DAG {dag_id}: {e}")
                continue
            
            # Assign permissions to the role
            try:
                permission_view_read = security_manager.find_permission_view_menu('can_read', f'DAG:{dag_id}')
                permission_view_edit = security_manager.find_permission_view_menu('can_edit', f'DAG:{dag_id}')
                permission_view_delete = security_manager.find_permission_view_menu('can_delete', f'DAG:{dag_id}')
                
                if permission_view_read not in role.permissions:
                    security_manager.add_permission_role(role, permission_view_read)
                    logger.info(f"Assigned read permission to role {role_name} for DAG {dag_id}")
                if permission_view_edit not in role.permissions:
                    security_manager.add_permission_role(role, permission_view_edit)
                    logger.info(f"Assigned edit permission to role {role_name} for DAG {dag_id}")
                if permission_view_delete not in role.permissions:
                    security_manager.add_permission_role(role, permission_view_delete)
                    logger.info(f"Assigned delete permission to role {role_name} for DAG {dag_id}")
            except Exception as e:
                logger.error(f"Error assigning permissions to role {role_name} for DAG {dag_id}: {e}")
                continue
        
        # Assign role to the user
        try:
            user = security_manager.find_user(username=owner)
            if user:
                security_manager.add_role(user, role)
                logger.info(f"Assigned role {role_name} to user {owner}")
            else:
                logger.warning(f"User {owner} not found in Airflow users.")
        except Exception as e:
            logger.error(f"Error assigning role {role_name} to user {owner}: {e}")
    
    logger.debug("Completed creating custom roles")

if __name__ == "__main__":
    logger.debug("Script execution started")
    create_custom_roles()
    logger.debug("Script execution finished")


---------


import subprocess
import logging
from airflow import settings
from airflow.models import DagModel

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_dag_owners():
    logger.debug("Starting to get DAG owners")
    session = settings.Session()
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
    logger.debug(f"Completed getting DAG owners: {dag_owners}")
    return dag_owners

def execute_command(command):
    try:
        logger.debug(f"Executing command: {command}")
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        logger.debug(result.stdout.decode('utf-8'))
        return result
    except subprocess.CalledProcessError as e:
        logger.error(e.stderr.decode('utf-8'))
        return None

def create_custom_roles():
    logger.debug("Starting to create custom roles")
    dag_owners = get_dag_owners()
    
    for owner, dag_ids in dag_owners.items():
        role_name = f"{owner}_group_access"
        logger.debug(f"Processing owner: {owner} with role: {role_name}")

        # Create role if not exists
        create_role_cmd = f"airflow roles create {role_name}"
        execute_command(create_role_cmd)
        
        # Create permissions and assign to the role
        for dag_id in dag_ids:
            for permission in ['can_read', 'can_edit', 'can_delete']:
                permission_name = f"{permission}_on_DAG:{dag_id}"
                add_permission_cmd = f"airflow roles add-permissions {role_name} {permission_name}"
                execute_command(add_permission_cmd)
                logger.info(f"Assigned {permission_name} to role {role_name}")

        # Assign role to the user
        add_role_cmd = f"airflow users add-role -r {role_name} -u {owner}"
        execute_command(add_role_cmd)
        logger.info(f"Assigned role {role_name} to user {owner}")
    
    logger.debug("Completed creating custom roles")

if __name__ == "__main__":
    logger.debug("Script execution started")
    create_custom_roles()
    logger.debug("Script execution finished")


--------------------------=

import subprocess
import logging
from airflow import settings
from airflow.models import DagModel

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_dag_owners():
    logger.debug("Starting to get DAG owners")
    session = settings.Session()
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
    logger.debug(f"Completed getting DAG owners: {dag_owners}")
    return dag_owners

def execute_command(command):
    try:
        logger.debug(f"Executing command: {command}")
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        logger.debug(result.stdout.decode('utf-8'))
        return result
    except subprocess.CalledProcessError as e:
        logger.error(e.stderr.decode('utf-8'))
        return None

def create_custom_roles():
    logger.debug("Starting to create custom roles")
    dag_owners = get_dag_owners()
    
    for owner, dag_ids in dag_owners.items():
        role_name = f"{owner}_group_access"
        logger.debug(f"Processing owner: {owner} with role: {role_name}")

        # Create role if not exists
        create_role_cmd = f"airflow roles create {role_name}"
        execute_command(create_role_cmd)
        
        # Create permissions and assign to the role
        for dag_id in dag_ids:
            for permission in ['can_read', 'can_edit', 'can_delete']:
                permission_name = f"{permission}_on_DAG:{dag_id}"
                # Explicitly create the permission
                create_permission_cmd = f"airflow roles add-permissions Admin {permission_name}"
                execute_command(create_permission_cmd)
                
                add_permission_cmd = f"airflow roles add-permissions {role_name} {permission_name}"
                execute_command(add_permission_cmd)
                logger.info(f"Assigned {permission_name} to role {role_name}")

        # Assign role to the user
        add_role_cmd = f"airflow users add-role -r {role_name} -u {owner}"
        execute_command(add_role_cmd)
        logger.info(f"Assigned role {role_name} to user {owner}")
    
    logger.debug("Completed creating custom roles")

if __name__ == "__main__":
    logger.debug("Script execution started")
    create_custom_roles()
    logger.debug("Script execution finished")


-----------------------------------------


import subprocess
import logging
from airflow import settings
from airflow.models import DagModel

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_dag_owners():
    logger.debug("Starting to get DAG owners")
    session = settings.Session()
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
    logger.debug(f"Completed getting DAG owners: {dag_owners}")
    return dag_owners

def execute_command(command):
    try:
        logger.debug(f"Executing command: {command}")
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        logger.debug(result.stdout.decode('utf-8'))
        return result
    except subprocess.CalledProcessError as e:
        logger.error(e.stderr.decode('utf-8'))
        return None

def create_custom_roles():
    logger.debug("Starting to create custom roles")
    dag_owners = get_dag_owners()
    
    for owner, dag_ids in dag_owners.items():
        role_name = f"{owner}_group_access"
        logger.debug(f"Processing owner: {owner} with role: {role_name}")

        # Create role if not exists
        create_role_cmd = f"airflow roles create {role_name}"
        execute_command(create_role_cmd)
        
        # Create permissions and assign to the role
        for dag_id in dag_ids:
            for permission in ['can_read', 'can_edit', 'can_delete']:
                permission_name = f"{permission}_on_DAG:{dag_id}"
                # Explicitly create the permission
                create_permission_cmd = f"airflow roles add-perm Admin {permission_name}"
                execute_command(create_permission_cmd)
                
                add_permission_cmd = f"airflow roles add-perm {role_name} {permission_name}"
                execute_command(add_permission_cmd)
                logger.info(f"Assigned {permission_name} to role {role_name}")

        # Assign role to the user
        add_role_cmd = f"airflow users add-role -r {role_name} -u {owner}"
        execute_command(add_role_cmd)
        logger.info(f"Assigned role {role_name} to user {owner}")
    
    logger.debug("Completed creating custom roles")

if __name__ == "__main__":
    logger.debug("Script execution started")
    create_custom_roles()
    logger.debug("Script execution finished")


---------------


import subprocess
import logging
from airflow import settings
from airflow.models import DagModel

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_dag_owners():
    logger.debug("Starting to get DAG owners")
    session = settings.Session()
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
    logger.debug(f"Completed getting DAG owners: {dag_owners}")
    return dag_owners

def execute_command(command):
    try:
        logger.debug(f"Executing command: {command}")
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        logger.debug(result.stdout.decode('utf-8'))
        return result
    except subprocess.CalledProcessError as e:
        logger.error(e.stderr.decode('utf-8'))
        return None

def create_custom_roles():
    logger.debug("Starting to create custom roles")
    dag_owners = get_dag_owners()
    
    for owner, dag_ids in dag_owners.items():
        role_name = f"{owner}_group_access"
        logger.debug(f"Processing owner: {owner} with role: {role_name}")

        # Create role if not exists
        create_role_cmd = f"airflow roles create {role_name}"
        execute_command(create_role_cmd)
        
        # Create permissions and assign to the role
        for dag_id in dag_ids:
            for action in ['can_read', 'can_edit', 'can_delete']:
                # Create permission
                create_permission_cmd = f"airflow roles add-perm -a {action} -r DAG:{dag_id} {role_name}"
                execute_command(create_permission_cmd)
                logger.info(f"Assigned {action} on DAG:{dag_id} to role {role_name}")

        # Assign role to the user
        add_role_cmd = f"airflow users add-role -r {role_name} -u {owner}"
        execute_command(add_role_cmd)
        logger.info(f"Assigned role {role_name} to user {owner}")
    
    logger.debug("Completed creating custom roles")

if __name__ == "__main__":
    logger.debug("Script execution started")
    create_custom_roles()
    logger.debug("Script execution finished")



-----------

import subprocess
import logging
from airflow import settings
from airflow.models import DagModel

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_dag_owners():
    logger.debug("Starting to get DAG owners")
    session = settings.Session()
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
    logger.debug(f"Completed getting DAG owners: {dag_owners}")
    return dag_owners

def execute_command(command):
    try:
        logger.debug(f"Executing command: {command}")
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        logger.debug(result.stdout.decode('utf-8'))
        return result
    except subprocess.CalledProcessError as e:
        logger.error(e.stderr.decode('utf-8'))
        return None

def create_custom_roles():
    logger.debug("Starting to create custom roles")
    dag_owners = get_dag_owners()
    
    for owner, dag_ids in dag_owners.items():
        role_name = f"{owner}_group_access"
        logger.debug(f"Processing owner: {owner} with role: {role_name}")

        # Create role if not exists
        create_role_cmd = f"airflow roles create {role_name}"
        execute_command(create_role_cmd)
        
        # Create permissions and assign to the role
        for dag_id in dag_ids:
            for action in ['read', 'edit', 'delete']:
                permission_name = f"can {action} on DAG:{dag_id}"
                # Create permission
                create_permission_cmd = f"airflow roles add-perms -a 'can {action}' -r 'DAG:{dag_id}' {role_name}"
                execute_command(create_permission_cmd)
                logger.info(f"Assigned can {action} on DAG:{dag_id} to role {role_name}")

    logger.debug("Completed creating custom roles")

if __name__ == "__main__":
    logger.debug("Script execution started")
    create_custom_roles()
    logger.debug("Script execution finished")


----------------


import subprocess
import logging
from airflow import settings
from airflow.models import DagModel

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_dag_owners():
    logger.debug("Starting to get DAG owners")
    session = settings.Session()
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
    logger.debug(f"Completed getting DAG owners: {dag_owners}")
    return dag_owners

def execute_command(command):
    try:
        logger.debug(f"Executing command: {command}")
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        logger.debug(result.stdout.decode('utf-8'))
        return result
    except subprocess.CalledProcessError as e:
        logger.error(e.stderr.decode('utf-8'))
        return None

def create_custom_roles():
    logger.debug("Starting to create custom roles")
    dag_owners = get_dag_owners()
    
    for owner, dag_ids in dag_owners.items():
        role_name = f"{owner}_group_access"
        logger.debug(f"Processing owner: {owner} with role: {role_name}")

        # Create role if not exists
        create_role_cmd = f"airflow roles create {role_name}"
        result = execute_command(create_role_cmd)
        if result:
            logger.info(f"Created role {role_name}")
        else:
            logger.info(f"Role {role_name} already exists or failed to create")

        # Create permissions and assign to the role
        for dag_id in dag_ids:
            for action in ['read', 'edit', 'delete']:
                # Create permission
                create_permission_cmd = f"airflow roles add-perms -a 'can_{action}' -r DAG:{dag_id} -v {role_name}"
                execute_command(create_permission_cmd)
                logger.info(f"Assigned can {action} on DAG:{dag_id} to role {role_name}")

    logger.debug("Completed creating custom roles")

if __name__ == "__main__":
    logger.debug("Script execution started")
    create_custom_roles()
    logger.debug("Script execution finished")


------------------------------------------;

from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from airflow.utils.dates import days_ago
import subprocess
import logging
from airflow import settings
from airflow.models import DagModel

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_dag_owners():
    logger.debug("Starting to get DAG owners")
    session = settings.Session()
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
    logger.debug(f"Completed getting DAG owners: {dag_owners}")
    return dag_owners

def execute_command(command):
    try:
        logger.debug(f"Executing command: {command}")
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        logger.debug(result.stdout.decode('utf-8'))
        return result
    except subprocess.CalledProcessError as e:
        logger.error(e.stderr.decode('utf-8'))
        return None

def create_custom_roles():
    logger.debug("Starting to create custom roles")
    dag_owners = get_dag_owners()
    
    for owner, dag_ids in dag_owners.items():
        role_name = f"{owner}_group_access"
        logger.debug(f"Processing owner: {owner} with role: {role_name}")

        # Create role if not exists
        create_role_cmd = f"airflow roles create {role_name}"
        result = execute_command(create_role_cmd)
        if result:
            logger.info(f"Created role {role_name}")
        else:
            logger.info(f"Role {role_name} already exists or failed to create")

        # Create permissions and assign to the role
        for dag_id in dag_ids:
            for action in ['read', 'edit', 'delete']:
                # Create permission
                create_permission_cmd = f"airflow roles add-perms -a 'can {action}' -r 'DAG:{dag_id}' -v {role_name}"
                execute_command(create_permission_cmd)
                logger.info(f"Assigned can {action} on DAG:{dag_id} to role {role_name}")

    logger.debug("Completed creating custom roles")

# Define the DAG
default_args = {
    'owner': 'airflow',
    'start_date': days_ago(1),
}

with DAG(
    dag_id='create_custom_roles_dag',
    default_args=default_args,
    schedule_interval=None,  # Set to None for manual triggering
    catchup=False,
) as dag:

    create_roles_task = PythonOperator(
        task_id='create_roles',
        python_callable=create_custom_roles
    )

    create_roles_task
