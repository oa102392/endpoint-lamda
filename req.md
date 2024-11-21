

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
