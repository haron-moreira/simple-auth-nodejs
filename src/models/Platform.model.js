const db = require('../config/db.config');
const logger = require("../utils/logger");

class PlatformModel {
    static async getPlatformByUUID(uuid) {
        const query = `
                              SELECT * FROM plataforms
                              WHERE uuid = ?
                              LIMIT 1
                            `;

        try {
            const [rows] = await db.execute(query, [uuid]);
            return rows[0] || null;
        } catch (error) {
            logger.error({
                message: 'Error to store the monitoring data',
                error: error,
                stack: __filename+"_18:40",
                params: [uuid]
            })
            console.error('Erro ao buscar plataforma por UUID:', error);
            return null;
        }
    }

    static async userHasAccessToPlatform(userId, platformUUID) {
        try {
            const platform = await this.getPlatformByUUID(platformUUID);
            if (!platform) return false;

            const query = `
                                    SELECT 1 FROM platform_permission_by_user
                                    WHERE id_user = ? AND id_platform = ?
                                    LIMIT 1
                                  `;

            const [rows] = await db.execute(query, [userId, platform.id_plataforms]);
            return rows.length > 0;
        } catch (error) {
            logger.error({
                message: 'Error to verify user permission to platform.',
                error: error,
                stack: __filename+"_44:40",
                params: [userId, platform.id_plataforms]
            })
            console.error('Error to verify user permission to platform:', error);
            return false;
        }
    }
}

module.exports = PlatformModel;
