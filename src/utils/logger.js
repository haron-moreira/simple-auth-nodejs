const winston = require('winston');
require('winston-cloudwatch');

const {
    AWS_REGION,
    CLOUDWATCH_GROUP,
    CLOUDWATCH_STREAM
} = process.env;

const cloudwatchTransport = new winston.transports.CloudWatch({
    logGroupName: CLOUDWATCH_GROUP,
    logStreamName: CLOUDWATCH_STREAM,
    awsRegion: AWS_REGION,
    jsonMessage: true
});

cloudwatchTransport.on('error', (err) => {
    console.error('Erro no transporte do CloudWatch:', err);
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'kakashi-auth' },
    transports: [
        new winston.transports.Console(),
        cloudwatchTransport
    ]
});


module.exports = logger;