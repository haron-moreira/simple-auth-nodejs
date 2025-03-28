const db = require('../config/db.config');
const logger = require("../utils/logger");

class MonitoringModel {
    static async storeMonitoringData(statusCode, response_time, isError) {
        const query = `
            INSERT INTO monitoring (response_time, response_code, is_server_error)
            VALUES (?, ?, ?)
        `;

        try {
            await db.execute(query, [response_time, statusCode, isError]);
            return true;
        } catch (error) {
            logger.error({
                message: 'Error to store the monitoring data',
                error: error,
                stack: __filename+"_18:40",
                params: [statusCode, response_time, isError]
            })
            console.error('Error to store the monitoring data:', error);
            return false;
        }
    }

    static async getMonitoringRecords() {
        try {
             const query = `
                 WITH last_500 AS (
                     SELECT response_time, is_server_error
                     FROM monitoring
                     ORDER BY id_monitoring DESC
                     LIMIT 500
                     )
                 SELECT
                     ROUND(AVG(response_time), 0) AS ms_response_time,
                     ROUND((SUM(NOT is_server_error) / COUNT(*)) * 100, 2) AS success_rate
                 FROM last_500;
                                  `;

            const [rows] = await db.execute(query, []);
            return rows[0];
        } catch (error) {
            logger.error({
                message: 'Error to get monitoring records.',
                error: error,
                stack: __filename+"_40:40",
                params: []
            })
            console.error('Error to get monitoring records:', error);
            return false;
        }
    }
}

module.exports = MonitoringModel;
