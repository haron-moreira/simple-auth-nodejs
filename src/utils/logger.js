const winston = require('winston');
const path = require('path');
const fs = require('fs');

const {
    AWS_REGION,
    CLOUDWATCH_GROUP,
    CLOUDWATCH_STREAM,
    NODE_ENV
} = process.env;

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Get current date for daily log files
const getLogFileName = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}.log`;
};

// Custom format for better readability
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Configure transports based on environment
const transports = [
    // Console transport (always enabled)
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, ...metadata }) => {
                let msg = `${timestamp} [${level}]: ${message}`;
                if (Object.keys(metadata).length > 0) {
                    msg += ` ${JSON.stringify(metadata)}`;
                }
                return msg;
            })
        )
    }),

    // Daily rotating file transport for all logs
    new winston.transports.File({
        filename: path.join(logsDir, getLogFileName()),
        level: 'info',
        format: logFormat,
        maxsize: 10485760, // 10MB
    }),

    // Separate file for errors
    new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        format: logFormat,
        maxsize: 10485760, // 10MB
    })
];

// Add CloudWatch transport only if AWS credentials are configured
if (AWS_REGION && CLOUDWATCH_GROUP && CLOUDWATCH_STREAM) {
    try {
        require('winston-cloudwatch');
        const cloudwatchTransport = new winston.transports.CloudWatch({
            logGroupName: CLOUDWATCH_GROUP,
            logStreamName: CLOUDWATCH_STREAM,
            awsRegion: AWS_REGION,
            jsonMessage: true,
            retentionInDays: 7
        });

        cloudwatchTransport.on('error', (err) => {
            console.error('CloudWatch transport error:', err);
        });

        transports.push(cloudwatchTransport);
        console.log('✓ CloudWatch logging enabled');
    } catch (error) {
        console.warn('⚠ CloudWatch not configured, using local file logging only');
    }
} else {
    console.log('ℹ CloudWatch not configured, using local file logging');
}

const logger = winston.createLogger({
    level: NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: {
        service: 'simple-auth-nodejs',
        environment: NODE_ENV || 'development'
    },
    transports
});

// Log rotation helper - clean logs older than 30 days
const cleanOldLogs = () => {
    const files = fs.readdirSync(logsDir);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    files.forEach(file => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime.getTime() < thirtyDaysAgo) {
            fs.unlinkSync(filePath);
            console.log(`Deleted old log file: ${file}`);
        }
    });
};

// Clean old logs on startup (only in production)
if (NODE_ENV === 'production') {
    cleanOldLogs();
}

module.exports = logger;