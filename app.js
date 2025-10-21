require('dotenv').config();
const { notFoundHandler, errorHandler } = require('./src/middlewares/error.middleware');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// Check if AWS X-Ray is enabled via environment variables
const AWS_XRAY_ENABLED = process.env.AWS_XRAY_ENABLED === 'true' &&
                         process.env.AWS_REGION &&
                         process.env.AWS_ACCESS_KEY_ID;

let AWSXRay;
if (AWS_XRAY_ENABLED) {
    try {
        AWSXRay = require('aws-xray-sdk');
        AWSXRay.captureHTTPsGlobal(require('http'));
        AWSXRay.setContextMissingStrategy('LOG_ERROR');
        console.log('✓ AWS X-Ray tracing enabled');
    } catch (error) {
        console.warn('⚠ AWS X-Ray not available, continuing without tracing');
    }
} else {
    console.log('ℹ AWS X-Ray disabled - set AWS_XRAY_ENABLED=true to enable');
}

// 🔁 Health check (não precisa de X-Ray)
app.get('/health', (_, res) => res.status(200).json({
    status: 'Simple Auth Node.js - OK',
    xray: AWS_XRAY_ENABLED ? 'enabled' : 'disabled'
}));

// 🎯 Início do trace X-Ray (se habilitado)
if (AWS_XRAY_ENABLED && AWSXRay) {
    app.use(AWSXRay.express.openSegment('simple-auth-nodejs'));
}

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

// 🎯 Middleware de subsegmento X-Ray por rota (se habilitado)
if (AWS_XRAY_ENABLED && AWSXRay) {
    const xrayRouteTracer = require('./src/middlewares/xrayRouteTracer');
    app.use(xrayRouteTracer);
}

// 🌐 Rotas centralizadas
const routes = require('./src/routes');
app.use(routes);

// 🔚 Rota não encontrada
app.use(notFoundHandler);

// ❌ Erros inesperados
app.use(errorHandler);

// 🧯 Fecha o trace X-Ray (se habilitado)
if (AWS_XRAY_ENABLED && AWSXRay) {
    app.use(AWSXRay.express.closeSegment());
}

// 🚀 Start do servidor
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Simple Auth Node.js running on port ${PORT}`));
}

module.exports = app;