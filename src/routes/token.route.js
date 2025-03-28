const express = require('express');
const router = express.Router();
const TokenController = require("../controllers/Token.controller");
const jwt = require('jsonwebtoken');
const responses = require("../helpers/responses");
const TransactionGenerator = require("../utils/TransactionGenerator");
const logger = require("../utils/logger");


const tokenControllerInstance = new TokenController({
    jwt: jwt,
    responses: responses,
    logger: logger,
    transaction: TransactionGenerator()
});


router.get('/surf/api/v3/validate', tokenControllerInstance.validateToken.bind(tokenControllerInstance));
router.get('/surf/api/v3/me', tokenControllerInstance.getMe.bind(tokenControllerInstance));

module.exports = router;
