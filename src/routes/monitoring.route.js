const express = require('express');
const router = express.Router();
const responses = require("../helpers/responses");
const TransactionGenerator = require("../utils/TransactionGenerator");
const logger = require("../utils/logger");
const MonitoringModel = require("../models/Monitoring.model");
const MonitoringController = require("../controllers/Monitoring.controller");


const MonitoringInstance = new MonitoringController({
    responses: responses,
    logger: logger,
    transaction: TransactionGenerator(),
    monitoringModel: MonitoringModel
});


router.get('/api/v1/monitoring', MonitoringInstance.getMonitoringPastData.bind(MonitoringInstance));

module.exports = router;
