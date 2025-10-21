require('dotenv').config();
const { notFoundHandler, errorHandler } = require('./src/middlewares/error.middleware');
const AWSXRay = require('aws-xray-sdk');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// 🔁 Captura global de HTTP e Promises
AWSXRay.captureHTTPsGlobal(require('http'));
AWSXRay.setContextMissingStrategy('LOG_ERROR');
//AWSXRay.capturePromise();

// 🔁 Health check fora do X-Ray (evita flood no service map)
app.get('/health', (_, res) => res.status(200).json({ status: 'Simple Auth Node.js - OK' }));

// 🎯 Início do trace X-Ray (precisa vir antes de qualquer rota/middleware)
app.use(AWSXRay.express.openSegment('simple-auth-nodejs'));

// 🧠 CORS
app.use(cors({
    origin: ['http://localhost:3001', 'https://seu-frontend.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'platform-access-uuid']
}));

// 🛡️ Headers de segurança
app.use(helmet());

// 🔒 Middleware opcional de headers (você pode ativar depois se quiser)
const enforceHeaders = require('./src/middlewares/headers.middleware');
// app.use(enforceHeaders);

// const monitoring = require('./src/middlewares/monitoring.middleware');
// app.use(monitoring());

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// 📦 Suporte JSON e form-urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const FullLogger = require('./src/middlewares/complete_log.middleware')
app.use(FullLogger.logRequestResponse)

// 🎯 Middleware de subsegmento X-Ray por rota
const xrayRouteTracer = require('./src/middlewares/xrayRouteTracer');
app.use(xrayRouteTracer);

// 🌐 Rotas centralizadas
const routes = require('./src/routes');
app.use(routes);

// 🔚 Rota não encontrada
app.use(notFoundHandler);

// ❌ Erros inesperados
app.use(errorHandler);

// 🧯 Fecha o trace
app.use(AWSXRay.express.closeSegment());

// 🚀 Start do servidor
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Simple Auth Node.js running on port ${PORT}`));
}

module.exports = app;