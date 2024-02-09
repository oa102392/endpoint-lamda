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
