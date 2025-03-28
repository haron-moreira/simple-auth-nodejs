const { v4: uuidv4 } = require('uuid');

function TransactionGenerator() {
    return uuidv4();
}

module.exports = TransactionGenerator;