# Simple Auth Node.js

A production-ready, lightweight JWT authentication microservice built with Node.js and Express. This service provides user authentication, token management, and platform-based access control, designed for easy integration into any microservices architecture.

## Features

- JWT-based authentication with refresh tokens
- Secure cookie support for web applications
- Platform-based access control
- Password hashing with bcrypt
- Token validation and refresh endpoints
- Performance monitoring
- AWS CloudWatch integration
- Ready for deployment on AWS ECS + Fargate + API Gateway

# Main routes
Here we have the complete authentication service, with routes like:

```
{host}/auth/api/v1/login -> the user will receive the JWT and Refresh Token.
{host}/auth/api/v1/login/web -> the user will receive the JWT and Refresh Token DIRECTLY on Secure Cookie.
{host}/auth/api/v1/refresh -> the user will run a refresh to his token, then he can still using the application without a new login.
{host}/auth/api/v1/logout -> the user will clean all refresh tokens.

{host}/token/api/v1/validate -> here the user will validate the JWT to continue using.
{host}/token/api/v1/me -> the user will get the JWT data decoded.
{host}/monitoring/api/v1/monitoring -> monitoring endpoint for checking service health.


```

# Installation

```bash
# Clone the repository
git clone https://github.com/haron-moreira/simple-auth-nodejs.git

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Setup database
mysql -u your_user -p your_database < example-db.sql

# Start the service
npm start

# Development mode with auto-reload
npm run dev
```

# Project Structure
```
simple-auth-nodejs/
.
├── Dockerfile
├── README.md
├── app.js
├── estrutura.txt
├── package-lock.json
├── package.json
└── src
    ├── config
    │   └── db.config.js
    ├── controllers
    │   ├── Auth.controller.js
    │   ├── Monitoring.controller.js
    │   └── Token.controller.js
    ├── helpers
    │   └── responses.js
    ├── middlewares
    │   ├── complete_log.middleware.js
    │   ├── error.middleware.js
    │   ├── headers.middleware.js
    │   ├── monitoring.middleware.js
    │   └── xrayRouteTracer.js
    ├── models
    │   ├── Monitoring.model.js
    │   ├── Platform.model.js
    │   ├── Token.model.js
    │   └── User.model.js
    ├── producers
    ├── routes
    │   ├── auth.route.js
    │   ├── index.js
    │   ├── monitoring.route.js
    │   └── token.route.js
    ├── services
    └── utils
        ├── TransactionGenerator.js
        └── logger.js
```

# Response Pattern:
```json
{
    "status": 0 | 1,
    "message": "A short description about the response.",
    "is_success": true | false,
    "transaction_id": "uuid-v4-for-each-transaction",
    "information": "here the information about the response will be inserted, as example JWT Token, refresh token etc",
    "response_code": "HTTP-RESPONSE-CODE_CODE-NUMBER (e.g., 200_1, 400_1, 401_1)"
}
```

## Response Codes
- **2xx Success Codes**: 200_1 to 200_6
- **4xx Client Error Codes**: 400_1 to 404_2
- **5xx Server Error Codes**: 500_1 to 500_2

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Database Configuration
HOST_DB=your-database-host
USER_DB=your-database-user
PASSWORD_DB=your-database-password
DATABASE_DB=your-database-name

# AWS Configuration (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
CLOUDWATCH_GROUP=your-cloudwatch-group
CLOUDWATCH_STREAM=your-cloudwatch-stream

# Environment
NODE_ENV=development
```

## License

MIT License - feel free to use this project as a template for your own authentication services.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.