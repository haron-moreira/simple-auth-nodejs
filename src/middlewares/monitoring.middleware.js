const MonitoringModel = require("../models/Monitoring.model");

const monitoring = () => {
    return (req, res, next) => {
        console.log(req.path);

        if (req.path.includes("monitoring")) {
            return next();
        }

        const inicio = Date.now();

        const originalSend = res.send;
        const originalStatus = res.status;

        res.status = function (statusCode) {
            res.locals.statusCode = statusCode;
            return originalStatus.call(this, statusCode);
        };

        res.send = function (body) {
            res.locals.body = body;
            return originalSend.call(this, body);
        };

        res.on('finish', async () => {

            const statusCode = res.locals.statusCode || 200;
            const errorCodes = [500, 501, 502, 503, 504, 505, 506, 507];

            const isError = errorCodes.includes(statusCode);

            const fim = Date.now();
            await MonitoringModel.storeMonitoringData(
                statusCode,
                (fim - inicio),
                isError
            );
        });

        next();
    };
};

module.exports = monitoring;
