const responses = require('../helpers/responses');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const notFoundHandler = (req, res, next) => {
    const transactionId = uuidv4();

    logger.warn('Rota não encontrada', {
        path: req.originalUrl,
        method: req.method,
        surf_code: '404_2',
        transaction_id: transactionId
    });

    return res.status(404).json({
        ...responses.error['404_2'](),
        transaction_id: transactionId
    });
};

const errorHandler = (err, req, res, next) => {
    const transactionId = uuidv4();

    logger.error('Erro não tratado', {
        message: err.message,
        stack: err.stack,
        surf_code: '500_1',
        path: req.originalUrl,
        method: req.method,
        transaction_id: transactionId
    });

    return res.status(500).json({
        ...responses.error['500_1'](),
        transaction_id: transactionId
    });
};

module.exports = {
    notFoundHandler,
    errorHandler
};
