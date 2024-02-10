# Start from the official Apache Airflow image for version 2.8.3 with Python 3.11
FROM apache/airflow:2.8.3-python3.11

# Set user to root to make necessary changes
USER root

# Apply modifications for FIPS compliance
# Modify Flask caching to use hashlib.sha256
RUN sed -i "s/cache_config = {'CACHE_TYPE': 'flask_caching.backends.filesystem', \
'CACHE_DIR': gettempdir()}/import hashlib\n    cache_config = \
{'CACHE_TYPE': 'flask_caching.backends.filesystem', 'CACHE_DIR': \
gettempdir(), 'CACHE_OPTIONS': {'hash_method': hashlib.sha256}}/g" \
/home/airflow/.local/lib/python3.11/site-packages/airflow/www/app.py \
 && find /home/airflow/.local/lib/python3.11/site-packages/airflow -type f \
-exec sed -i "s/hashlib.md5/hashlib.sha256/g" {} \;

# Now attempt to run apt-get update and any necessary installations
RUN apt-get update && apt-get install -y --no-install-recommends \
    # list any packages you need to install here
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Switch back to the airflow user
USER airflow


RUN sed -i 's/https:\/\/deb.debian.org/http:\/\/deb.debian.org/g' /etc/apt/sources.list \
 && apt-get update \
 && apt-get install -y openssl \
 # Revert back to HTTPS repositories after installation
 && sed -i 's/http:\/\/deb.debian.org/https:\/\/deb.debian.org/g' /etc/apt/sources.list


 # Configure OpenSSL for FIPS mode (Example for OpenSSL 3.0)
# Create or modify the OpenSSL configuration file to enable FIPS mode
RUN echo "[openssl_init]\nproviders = provider_sect\n\n[provider_sect]\ndefault = default_sect\nfips = fips_sect\n\n[default_sect]\nactivate = 1\n\n[fips_sect]\nactivate = 1" > /etc/ssl/openssl.cnf

# For OpenSSL 1.0.2, you might need to set environment variables like so:
# ENV OPENSSL_FIPS=1

# Copy your custom Python script into the container
COPY configure_fips_caching.py /tmp/configure_fips_caching.py

# Execute the script to modify app.py for FIPS-compliant caching
RUN python /tmp/configure_fips_caching.py


import hashlib
from tempfile import gettempdir
from pathlib import Path

# Path to Airflow's app.py or the appropriate file to modify
app_py_path = Path('/home/airflow/.local/lib/python3.11/site-packages/airflow/www/app.py')

# Read the content of app.py
content = app_py_path.read_text()

# Place to insert the cache configuration
insert_point = "from flask import Flask"

# Cache configuration with FIPS-compliant modifications
cache_config = '''
import hashlib
from flask_caching import Cache
cache_config = {
    'CACHE_TYPE': 'flask_caching.backends.filesystem',
    'CACHE_DIR': gettempdir(),
    'CACHE_OPTIONS': {'hash_method': hashlib.sha256}
}
Cache(app=flask_app, config=cache_config)
'''

# Insert the cache configuration after the insert point
modified_content = content.replace(insert_point, insert_point + cache_config)

# Write the modified content back to app.py
app_py_path.write_text(modified_content)



from pathlib import Path

# Define the path to the Airflow app.py file
app_py_path = Path('/home/airflow/.local/lib/python3.11/site-packages/airflow/www/app.py')

# Define the insertion point and the code to insert
insertion_point = "flask_app = Flask(__name__)"
code_to_insert = """
import hashlib
from tempfile import gettempdir
from flask_caching import Cache
cache_config = {
    'CACHE_TYPE': 'flask_caching.backends.filesystem',
    'CACHE_DIR': gettempdir(),
    'CACHE_OPTIONS': {'hash_method': hashlib.sha256}
}
Cache(app=flask_app, config=cache_config)
"""

# Read the current contents of app.py
with app_py_path.open('r') as file:
    content = file.readlines()

# Find the line to insert the new caching configuration after
index = 0
for line in content:
    if insertion_point in line:
        break
    index += 1

# Insert the new caching configuration code
content.insert(index + 1, code_to_insert)

# Write the modified content back to app.py
app_py_path.write_text(''.join(content))


