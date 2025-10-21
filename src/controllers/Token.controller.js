
class TokenController {

    constructor({jwt, responses, logger, transaction}) {
        this.transaction = transaction;
        this.jwt = jwt;
        this.logger = logger;
        this.responses = responses;
    }

    validateToken = (req, res) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json(this.responses.error["400_4"](this.transaction));

        console.log(token);

        try {
            const decoded = this.jwt.verify(token, process.env.JWT_SECRET);
            return res.status(200).json(this.responses.success["200_2"](this.transaction ,{ valid: true, decoded }));
        } catch (err) {
            return res.status(401).json(this.responses.error["401_2"](this.transaction));
        }
    };

    getMe = (req, res) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json(this.responses.error["400_4"](this.transaction));

        try {
            const decoded = this.jwt.verify(token, process.env.JWT_SECRET);
            return res.status(200).json(this.responses.success["200_5"](this.transaction ,
                { decoded }));
        } catch (err) {
            return res.status(401).json(this.responses.error["401_2"](this.transaction));
        }
    };
}

module.exports = TokenController;
