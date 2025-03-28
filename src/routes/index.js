const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.route');
const tokenRoutes = require('./token.route');
const monitoringRoutes = require('./monitoring.route');

router.use('/auth', authRoutes);
router.use('/token', tokenRoutes);
router.use('/monitoring', monitoringRoutes);

module.exports = router;
