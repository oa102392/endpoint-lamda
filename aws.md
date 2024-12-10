## Setting Up AWS for the Backend

The backend requires AWS credentials to authenticate and access AWS services such as S3. These credentials and configuration are set up in the middleware code (`app/app.js`) using `AWS.config.update`. Follow the steps below to ensure proper setup:

### 1. Required AWS Configuration

The following AWS credentials and configuration are required:

- **Access Key ID**: Your AWS Access Key ID, used to authenticate API requests.
- **Secret Access Key**: Your AWS Secret Access Key, used alongside the Access Key ID for secure authentication.
- **Region**: The AWS region where your services (e.g., S3 bucket) are hosted.
- **HTTPS Proxy (Optional)**: If using a proxy, provide the HTTPS proxy URL.

These values are passed to the `AWS.config.update` method as shown in the code snippet below:

```javascript
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  httpOptions: {
    agent: new proxy.ProxyAgent(process.env.HTTPS_PROXY),
  },
});

## Setting Environment Variables

The AWS credentials and configuration can be set using environment variables. Below are the steps to define these variables in a **Dockerfile** and a **Jenkinsfile**.

---

### 1. Setting Environment Variables in a Dockerfile

To pass AWS credentials and configuration to your Docker container, you can set them using the `ENV` instruction in your `Dockerfile`:

```dockerfile
# Dockerfile
FROM node:14

# Set environment variables for AWS
ENV AWS_ACCESS_KEY_ID=your-access-key-id
ENV AWS_SECRET_ACCESS_KEY=your-secret-access-key
ENV AWS_REGION=your-region
ENV HTTPS_PROXY=http://your-proxy-url # Optional

# Install dependencies and start the app
WORKDIR /app
COPY . /app
RUN npm install
CMD ["npm", "start"]
```

Replace your-access-key-id, your-secret-access-key, your-region, and http://your-proxy-url with your actual AWS credentials and configurations.

## Setting Environment Variables in a Jenkinsfile

To set environment variables for AWS in your Jenkins pipeline, use the `environment` block in your **Jenkinsfile**:

```groovy
pipeline {
    agent any

    environment {
        AWS_ACCESS_KEY_ID = 'your-access-key-id'
        AWS_SECRET_ACCESS_KEY = 'your-secret-access-key'
        AWS_REGION = 'your-region'
        HTTPS_PROXY = 'http://your-proxy-url' // Optional
    }

    stages {
        stage('Build') {
            steps {
                echo 'Building the application...'
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'npm test'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying the application...'
                sh 'npm start'
            }
        }
    }
}
```
Replace the placeholders (your-access-key-id, your-secret-access-key, your-region, and http://your-proxy-url) with your actual AWS credentials and configurations.

## Finding AWS Credentials and Region

### Access Key ID and Secret Access Key

1. Log in to your [AWS Management Console].
2. Navigate to **IAM** (Identity and Access Management).
3. Create a new IAM user or use an existing one with programmatic access.
4. Assign the appropriate permissions (e.g., `AmazonS3FullAccess` for S3 access).
5. Download the credentials, which include the **Access Key ID** and **Secret Access Key**.

### Region

- The **region** is where your AWS services are hosted (e.g., `us-west-1` for California).  
- You can find this in the **AWS Management Console**:  
  - Look in the **top-right corner** of the console.  
  - Alternatively, check the details of your S3 bucket for the region information.

---

## Additional Notes

- Ensure that the IAM user has the necessary permissions for the AWS services being used (e.g., S3 read/write access).
- If you are using a proxy, make sure to include the `HTTPS_PROXY` environment variable to specify the proxy URL.

By setting these configurations and environment variables correctly, the backend will be able to authenticate with AWS and access required services.





## Setting Up an S3 Bucket on AWS

To store and manage files in your application, you need to create an S3 bucket on AWS and configure it for proper use with your application. Follow these steps:

---

### 1. Creating an S3 Bucket on AWS

1. **Log in to AWS Console**: Go to the [AWS Management Console](https://aws.amazon.com/console/).
2. **Navigate to S3**: Search for **S3** in the AWS services search bar and click on it.
3. **Create a New Bucket**:
   - Click the **"Create bucket"** button.
   - Provide a unique bucket name (e.g., `your-bucket-name`).
   - Choose the AWS region where you want to create the bucket (e.g., `us-west-1`).
4. **Set Permissions**:
   - Ensure the bucket allows access only to authenticated users by default.
   - Disable public access unless explicitly required.
5. **Create the Bucket**: Click **"Create bucket"** to finalize.

---

### 2. Adding Subdirectories to the S3 Bucket

Once the bucket is created, add the following three subdirectories for file organization:

#### Subdirectory Structure and Purpose

1. **`received_files`**
   - This folder stores GeoJSON files that are waiting to be processed by the S3 bucket insertion API endpoint.

2. **`processed_and_archived`**
   - This folder stores GeoJSON files that were successfully processed by the S3 bucket insertion API and archived. The contents of these files were successfully inserted into the database.

3. **`error_in_file`**
   - This folder stores GeoJSON files that failed to process. These files did not meet the requirements for insertion into the database (e.g., incorrect JSON format or missing required fields).

#### Instructions for Adding Subdirectories

1. Go to your newly created bucket in the **S3 Management Console**.
2. Click **"Create folder"** and enter the folder name (e.g., `received_files`).
3. Repeat this process for the other two folders: `processed_and_archived` and `error_in_file`.

---

### 3. Explaining Authentication in the Code

In the backend code, the application uses AWS SDK to authenticate and interact with the S3 bucket. The bucket name is dynamically assigned using the `S3_BUCKET_NAME` environment variable.

#### Relevant Code

```javascript
const bucketName = process.env.S3_BUCKET_NAME;
const s3 = new AWS.S3();

// Example usage
s3.listObjectsV2({ Bucket: bucketName }, (err, data) => {
  if (err) {
    console.error("Error accessing bucket:", err);
  } else {
    console.log("Bucket contents:", data);
  }
});
```