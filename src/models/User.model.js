const database = require('../config/db.config');
const logger = require("../utils/logger");

class UserModel {
    static async findByUsername(username) {
        const query = `SELECT uc.id_user, uc.username, uc.password_hash, uc.profile, uc.status = 1 as status, uc.first_name, uc.last_name, uc.role, ro.uuid as main_origin, uc.uuid
                                FROM user uc
                                LEFT JOIN recharge_origin ro ON ro.id_recharge_origin = uc.main_origin WHERE uc.username = ? AND uc.status = 1;`;
        try {
            const [rows] = await database.execute(query, [username]);
            return rows[0] || false;
        } catch (error) {
            logger.error({
                message: 'Error to find user by username',
                error: error,
                stack: __filename+"_16:40",
                params: [username]
            })
            console.error('Error to find user:', error);
            throw error;
        }
    }

    static async findById(id) {
        const query = `SELECT uc.id_user, uc.username, uc.password_hash, uc.profile, uc.status = 1 as status, uc.first_name, uc.last_name, uc.role, ro.uuid as main_origin, uc.uuid
                                FROM user uc
                                LEFT JOIN recharge_origin ro ON ro.id_recharge_origin = uc.main_origin WHERE uc.id_user = ? AND uc.status = 1;`;
        try {
            const [rows] = await database.execute(query, [id]);
            return rows[0] || false;
        } catch (error) {
            logger.error({
                message: 'Error to find user by id',
                error: error,
                stack: __filename+"_35:40",
                params: [id]
            })
            console.error('Error to find user by id:', error);
            throw error;
        }
    }
}

module.exports = UserModel;
