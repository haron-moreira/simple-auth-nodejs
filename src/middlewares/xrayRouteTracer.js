const AWSXRay = require('aws-xray-sdk');

module.exports = (req, res, next) => {
    const segment = AWSXRay.getSegment();

    if (!segment) {
        console.warn('⚠️ Nenhum segmento X-Ray ativo na rota:', req.originalUrl);
    }


    if (!segment) {
        return next();
    }

    const subsegment = segment.addNewSubsegment(`route:${req.method} ${req.originalUrl}`);

    // Fecha o subsegmento ao terminar a resposta
    res.on('finish', () => {
        subsegment.close();
    });

    // Em caso de erro
    res.on('error', (err) => {
        subsegment.addError(err);
        subsegment.close();
    });

    next();
};
