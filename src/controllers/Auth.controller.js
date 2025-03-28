const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

class AuthController {
    constructor({ userModel, tokenModel, platformModel, logger, responses, transaction }) {
        this.userModel = userModel;
        this.tokenModel = tokenModel;
        this.platformModel = platformModel;
        this.logger = logger;
        this.responses = responses;
        this.transaction = transaction;
        this.JWT_SECRET = process.env.JWT_SECRET || 'kakashi-secret';
    }

    loginAPI = async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            this.logger.error({
                message: 'Username or password is required',
                body: req.body,
                headers: req.headers,
                stack: __filename+"_24:40",
                surf_code: "400_1"
            })
            return res.status(400).json(this.responses.error["400_1"](this.transaction))
        }


        if (username.length > 255 || password.length > 255) {
            this.logger.error({
                message: 'Username or password is INVALID',
                body: req.body,
                headers: req.headers,
                stack: __filename+"_24:40",
                surf_code: "400_1"
            })
            return res.status(400).json(this.responses.error["400_1"](this.transaction))
        }

        try {
            const user = await this.userModel.findByUsername(username);
            if (!user) return res.status(401).json(this.responses.error["401_1"](this.transaction));

            const isValid = await bcrypt.compare(password, user.password_hash);
            if (!isValid) return res.status(401).json(this.responses.error["401_1"](this.transaction));

            const platformUUID = req.headers['platform-access-uuid'] || "628f0d0e-9b06-11ef-87be-02b8de36cb3d";
            const hasAccess = await this.platformModel.userHasAccessToPlatform(user.id_user, platformUUID);

            if (!hasAccess) {
                return res.status(403).json(this.responses.error["403_1"](this.transaction));
            }

            const delete_token = await this.tokenModel.deleteAllTokensForUser(user.id_user)
            if (!delete_token) {
                return res.status(500).json(this.responses.error["500_2"](this.transaction));
            }

            const token = jwt.sign({
                id: user.id,
                username: user.username,
                accessLevel: user.profile,
                status: user.status,
                id_user: user.id_user,
                name: `${user.first_name} ${user.last_name}`,
                role: user.role,
                created: user.dt_created,
                lastUpdate: user.dt_last_update,
                origin: user.main_origin,
                uuid: user.uuid
            }, this.JWT_SECRET, { expiresIn: '1h' });

            const refreshToken = uuidv4();
            const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 dias

            const saved = await this.tokenModel.storeRefreshToken(user.id_user, refreshToken, expiresAt);
            if (!saved) {
                return res.status(500).json(this.responses.error["500_2"](this.transaction));
            }

            return res.status(200).json(this.responses.success["200_1"](this.transaction, { token, refreshToken }));
        } catch (err) {
            console.error('Erro no loginAPI:', err);
            return res.status(500).json(this.responses.error["500_1"](this.transaction));
        }
    };

    loginWeb = async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json(this.responses.error["400_1"](this.transaction))
        }

        try {
            const user = await this.userModel.findByUsername(username);
            if (!user) return res.status(401).json(this.responses.error["401_1"](this.transaction));

            const isValid = await bcrypt.compare(password, user.password_hash);
            if (!isValid) return res.status(401).json(this.responses.error["401_1"](this.transaction));

            const token = jwt.sign({
                id: user.id,
                username: user.username,
                accessLevel: user.profile,
                status: user.status,
                id_user: user.id_user,
                name: `${user.first_name} ${user.last_name}`,
                role: user.role,
                created: user.dt_created,
                lastUpdate: user.dt_last_update,
                origin: user.main_origin,
                uuid: user.uuid
            }, this.JWT_SECRET, { expiresIn: '1h' });

            const refreshToken = uuidv4();
            const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 dias

            const saved = await this.tokenModel.storeRefreshToken(user.id_user, refreshToken, expiresAt);
            if (!saved) {
                return res.status(500).json(this.responses.error["500_2"](this.transaction));
            }

            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 60 * 60 * 1000
            });

            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dias
            });

            return res.status(200).json(this.responses.success["200_1"](this.transaction, {
                message: 'Login Successfully, your token has been added in cookies.',
            }));
        } catch (err) {
            console.error('Erro no loginWeb:', err);
            return res.status(500).json(this.responses.error["500_2"](this.transaction));
        }
    };

    refreshToken = async (req, res) => {
        try {
            const oldRefreshToken = req.cookies?.refresh_token;

            if (!oldRefreshToken) {
                return res.status(400).json(this.responses.error["400_3"](this.transaction));
            }

            const stored = await this.tokenModel.findRefreshToken(oldRefreshToken);
            if (!stored) {
                return res.status(401).json(this.responses.error["401_2"](this.transaction));
            }

            const deleted = await this.tokenModel.deleteRefreshToken(oldRefreshToken);
            if (!deleted) {
                return res.status(500).json(this.responses.error["500_2"](this.transaction));
            }


            const user = await this.userModel.findByUsername(stored.user_id);
            const newAccessToken = jwt.sign({
                id: user.id,
                username: user.username,
                accessLevel: user.profile,
                status: user.status,
                id_user: user.id_user,
                name: `${user.first_name} ${user.last_name}`,
                role: user.role,
                created: user.dt_created,
                lastUpdate: user.dt_last_update,
                origin: user.main_origin,
                uuid: user.uuid
            }, this.JWT_SECRET, { expiresIn: '1h' });

            const newRefreshToken = uuidv4();
            const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

            const saved = await this.tokenModel.storeRefreshToken(stored.user_id, newRefreshToken, expiresAt);
            if (!saved) {
                return res.status(500).json(this.responses.error["500_2"](this.transaction));
            }

            res.cookie('auth_token', newAccessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 60 * 60 * 1000
            });

            res.cookie('refresh_token', newRefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 1000 * 60 * 60 * 24 * 7
            });

            return res.status(200).json(this.responses.success["200_3"](this.transaction, {
                message: 'Refresh Token Done.',
            }));

        } catch (error) {
            console.error('Erro no refreshToken:', error);
            return res.status(500).json(this.responses.error["500_1"](this.transaction));
        }
    };


    logout = async (req, res) => {
        try {
            const refreshToken = req.cookies?.refresh_token;
            if (refreshToken) {
                await this.tokenModel.deleteRefreshToken(refreshToken);
            }

            res.clearCookie('auth_token');
            res.clearCookie('refresh_token');

            return res.status(200).json(this.responses.success["200_4"](this.transaction, {
                message: 'Logout done!'
            }));
        } catch (error) {
            console.error('Erro no logout:', error);
            return res.status(500).json(this.responses.error["500_1"](this.transaction));
        }
    };

}

module.exports = AuthController;
