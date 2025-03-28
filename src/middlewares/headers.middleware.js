module.exports = (req, res, next) => {
    const allowedHeaders = [
        'content-type',
        'authorization',
        'user-agent',
        'accept',
        'origin',
        'referer',
        'cookie' // se estiver usando cookies
    ];

    const requestHeaders = Object.keys(req.headers);

    const invalidHeaders = requestHeaders.filter(
        (header) => !allowedHeaders.includes(header.toLowerCase())
    );

    // // Check content-type
    // const isJson = req.is('application/json');
    //
    // if (!isJson) {
    //     return res.status(415).json({ message: 'Content-Type must be application/json' });
    // }

    if (invalidHeaders.length > 0) {
        return res.status(400).json({
            message: 'Invalid headers detected',
            invalid: invalidHeaders
        });
    }

    next();
};
