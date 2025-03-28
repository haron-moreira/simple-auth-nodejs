
const onFinished = require("on-finished");
const logger = require("../utils/logger");

// Unified Middleware to Log Requests and Responses
class FullLogger {
    static async logRequestResponse(req, res, next) {
        const startTime = Date.now();

        if (!req.headers['platform-access-uuid']) {
            req.headers['platform-access-uuid'] = "628f0d0e-9b06-11ef-87be-02b8de36cb3d";
        }

        // Log the request
        const requestDetails = {
            method: req.method,
            url: req.originalUrl,
            headers: req.headers,
            body: req.originalUrl.includes("auth") ? {username: req.body.username, password: "PRIVATE CREDENTIAL"} : req.body
        };

        const originalJson = res.json;
        let responseBody = null;

        res.json = function (body) {
            responseBody = body;
            return originalJson.call(this, body);
        };
        // Log the response after it is finished
        onFinished(res, () => {
            const responseDetails = {
                statusCode: res.statusCode,
                responseTime: Date.now() - startTime + "ms",
                data: responseBody
            };

            // Combine request and response details into one log entry
            logger.info({
                message: 'REQ_AND_RES_LOG',
                request: requestDetails,
                response: responseDetails,
            });
        });

        next();

    }
}


module.exports = FullLogger;