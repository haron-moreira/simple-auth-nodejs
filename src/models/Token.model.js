const db = require('../config/db.config');
const logger = require('../utils/logger');

class TokenModel {
    static async storeRefreshToken(userId, token, expiresAt) {
        const query = `
            INSERT INTO refresh_token (user_id, token, expires_at)
            VALUES (?, ?, ?)
        `;

        try {
            await db.execute(query, [userId, token, expiresAt]);
            return true;
        } catch (error) {
            logger.error({
                message: 'Error to store refresh token',
                error: error,
                stack: __filename+"_18:40",
                params: [userId, token, expiresAt]
            })
            console.error('Error to store refresh token:', error);
            return false;
        }
    }

    static async findRefreshToken(token) {
        const query = `
            SELECT * FROM refresh_token
            WHERE token = ? AND expires_at > NOW()
                LIMIT 1
        `;

        try {
            const [rows] = await db.execute(query, [token]);
            return rows[0] || null;
        } catch (error) {
            logger.error({
                message: 'Error to find refresh token',
                error: error,
                stack: __filename+"_40:40",
                params: [token]
            })
            console.error('Error to find refresh token:', error);
            return null;
        }
    }

    static async deleteRefreshToken(token) {
        const query = `
            DELETE FROM refresh_token
            WHERE token = ?
        `;

        try {
            await db.execute(query, [token]);
            return true;
        } catch (error) {
            logger.error({
                message: 'Error to delete the refresh token',
                error: error,
                stack: __filename+"_61:40",
                params: [token]
            })
            console.error('Error to delete the refresh token:', error);
            return false;
        }
    }

    static async deleteAllTokensForUser(userId) {
        const query = `
            DELETE FROM refresh_token
            WHERE user_id = ?
        `;

        try {
            await db.execute(query, [userId]);
            return true;
        } catch (error) {
            logger.error({
                message: 'Error to delete all refresh tokens from the user',
                error: error,
                stack: __filename+"_82:40",
                params: [userId]
            })
            console.error('Error to delete all refresh tokens from the user:', error);
            return false;
        }
    }
}

module.exports = TokenModel;
