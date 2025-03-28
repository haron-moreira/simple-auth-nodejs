# kakashi-authentication
Authentication microservice for the new microservices-based architecture.   Responsible for user login, JWT issuance, and identity validation across all services.   Built for deployment on AWS using ECS + Fargate + API Gateway.   Currently under migration from monolithic architecture.

# Main routes
Here we have the complete authentication service, with routes like:

```
{host}/auth/surf/api/v3/login -> the user will receive the JWT and Refresh Token.
{host}/auth/surf/api/v3/login/web -> the user will receive the JWT and Refresh Token DIRECTLY on Secure Cookie.
{host}/auth/surf/api/v3/refresh -> the user will run a refresh to his token, then he can still using the application without a new login.
{host}/auth/surf/api/v3/logout -> the user will clean all refresh tokens.

{host}/token/surf/api/v3/validate -> here the user will validate the JWT to continue using.
{host}/token/surf/api/v3/me -> the user will get the JWT data decoded.


```

# Project Structure
```
kakashi-authentication/
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
```
{
    status: 0 / 1,
    message: "A short description about the response.",
    is_success: true / false,
    transaction_id: "uuiv4-for-each-transaction",
    information: [here the information about the response will be inserted, as example JWT Token, refresh token etc],
    surf_code: HTTP-RESPONSE-CODE_CODE-NUMBER (200_1)
}
```