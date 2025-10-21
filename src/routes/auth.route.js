const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/Auth.controller');
const UserModel = require('../models/User.model');
const TokenModel = require('../models/Token.model');
const PlatformModel = require('../models/Platform.model');
const logger = require('../utils/logger');
const responses = require('../helpers/responses');
const TransactionGenerator = require('../utils/TransactionGenerator');

// 💉 Dependency Injection
const authController = new AuthController({
    userModel: UserModel,
    tokenModel: TokenModel,
    platformModel: PlatformModel,
    logger,
    responses,
    transaction: TransactionGenerator()
});

// 🛡️ Routes
router.post('/api/v1/login', authController.loginAPI.bind(authController));
router.post('/api/v1/login/web', authController.loginWeb.bind(authController));
router.post('/api/v1/refresh', authController.refreshToken.bind(authController));
router.post('/api/v1/logout', authController.logout.bind(authController));

module.exports = router;
