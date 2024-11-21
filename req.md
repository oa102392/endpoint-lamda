

## Middleware Prerequisites
To run this application, you must have the following dependencies installed. Ensure you use the specified versions for compatibility.

### Required Libraries and Versions

1. **@babel/core**: `7.23.2`
2. **JSONStream**: `^1.3.5`
3. **aws-sdk**: `^2.1403.0`
4. **bcrypt**: `^5.1.0`
5. **body-parser**: `^1.20.3`
6. **cookie-parser**: `^1.4.6`
7. **cors**: `^2.8.5`
8. **ejs**: `^3.1.9`
9. **express**: `^4.20.0`
10. **express-session**: `^1.18.0`
11. **jsonwebtoken**: `^9.0.2`
12. **moment**: `^2.30.1`
13. **mysql**: `^2.18.1`
14. **node-fetch**: `^3.3.2`
15. **passport**: `^0.7.0`
16. **passport-http-bearer**: `^1.0.1`
17. **passport-jwt**: `^4.0.1`
18. **passport-local**: `^1.0.0`
19. **proxy-agent**: `^6.3.0`
20. **pump**: `^3.0.0`
21. **stream**: `^0.0.2`
22. **supertest**: `^6.3.4`

### For Testing
The following libraries are used for testing purposes:
1. **chai**: `^4.3.7`
2. **chai-http**: `^4.3.7`
3. **mocha**: `^10.4.0`
4. **supertest**: `^6.3.4`

---

## Installation

Follow these steps to install the dependencies:

1. Ensure you have Node.js installed (preferably version 14 or higher).
2. Clone the repository to your local machine.
3. Run the following command to install all dependencies:
   ```bash
   npm install

## Testing

The project includes a comprehensive suite of **Mocha tests** to ensure reliability and functionality. To run the tests, execute the following command:

```bash
npm test
```


## Notes:
- Make sure to set the `JWT_KEY` environment variable before running the tests.
- The tests include integration and API tests using **Mocha**, **Chai**, and **Supertest**.



# RASP Dashboard

## Overview
The **RASP Dashboard** is a data visualization tool developed to support display and analysis for specific use cases. This document provides instructions for setting up the required libraries, running the application, and executing tests.

---

## Prerequisites
To run this application, you must have the following dependencies installed. Ensure you use the specified versions for compatibility.

### Required Libraries and Purposes

1. **@babel/core**: `7.23.2`  
   *Purpose*: Used to transpile JavaScript code for compatibility across different environments.

2. **JSONStream**: `^1.3.5`  
   *Purpose*: Provides streaming JSON parsing and stringifying, useful for processing large JSON data efficiently.

3. **aws-sdk**: `^2.1403.0`  
   *Purpose*: Enables interaction with AWS services, such as S3 or DynamoDB, for cloud-related operations.

4. **bcrypt**: `^5.1.0`  
   *Purpose*: Used for hashing and securely storing passwords.

5. **body-parser**: `^1.20.3`  
   *Purpose*: Parses incoming request bodies, making it easier to access data in HTTP requests.

6. **cookie-parser**: `^1.4.6`  
   *Purpose*: Parses cookies attached to client requests, enabling session management and authentication.

7. **cors**: `^2.8.5`  
   *Purpose*: Provides middleware to enable Cross-Origin Resource Sharing (CORS) for secure communication between servers and browsers.

8. **ejs**: `^3.1.9`  
   *Purpose*: A templating engine used to generate HTML dynamically.

9. **express**: `^4.20.0`  
   *Purpose*: A minimalist web framework used for building APIs and web applications.

10. **express-session**: `^1.18.0`  
    *Purpose*: Manages sessions for users, including storing and retrieving session data.

11. **jsonwebtoken**: `^9.0.2`  
    *Purpose*: Handles creating, signing, and verifying JSON Web Tokens (JWT) for secure authentication.

12. **moment**: `^2.30.1`  
    *Purpose*: Provides utilities for parsing, validating, and manipulating dates and times.

13. **mysql**: `^2.18.1`  
    *Purpose*: Enables interaction with MySQL databases for storing and retrieving application data.

14. **node-fetch**: `^3.3.2`  
    *Purpose*: A lightweight library to make HTTP requests in Node.js.

15. **passport**: `^0.7.0`  
    *Purpose*: Authentication middleware for Node.js, supporting various authentication strategies.

16. **passport-http-bearer**: `^1.0.1`  
    *Purpose*: Implements Bearer Token authentication for APIs.

17. **passport-jwt**: `^4.0.1`  
    *Purpose*: Adds support for JSON Web Tokens (JWT) authentication to Passport.

18. **passport-local**: `^1.0.0`  
    *Purpose*: Provides local (username and password-based) authentication for Passport.

19. **proxy-agent**: `^6.3.0`  
    *Purpose*: Helps manage proxy configurations when making HTTP or HTTPS requests.

20. **pump**: `^3.0.0`  
    *Purpose*: A small utility that combines streams and manages backpressure automatically.

21. **stream**: `^0.0.2`  
    *Purpose*: Simplifies working with streams for handling large amounts of data efficiently.

22. **supertest**: `^6.3.4`  
    *Purpose*: Enables testing of HTTP requests for APIs and web applications.

### For Testing
The following libraries are used for testing purposes:

1. **chai**: `^4.3.7`  
   *Purpose*: Assertion library for writing readable tests.

2. **chai-http**: `^4.3.7`  
   *Purpose*: Extends Chai to test HTTP requests easily.

3. **mocha**: `^10.4.0`  
   *Purpose*: A testing framework used for writing and running tests.

4. **supertest**: `^6.3.4`  
   *Purpose*: Combines with testing frameworks like Mocha to test HTTP endpoints.

---

## Installation

Follow these steps to install the dependencies:

1. Ensure you have Node.js installed (preferably version 14 or higher).
2. Clone the repository to your local machine.
3. Run the following command to install all dependencies:
   ```bash
   npm install



## Keeping Test Files in the Right Directory

To ensure that **Mocha** can find and execute your test files, make sure all test files are located in the `test` directory at the root of your project. By default, the project expects the following directory structure:

```bash
project-root/
├── app.js
├── package.json
├── test/
│   ├── example.test.js
│   ├── api.test.js
│   └── other-tests.js
