
const responses = {
    success: {
        '200_1': (transaction, info = {}) => ({
            status: 1,
            message: 'Authentication successful!',
            is_success: true,
            transaction_id: transaction,
            information: info,
            surf_code: '200_1',
        }),

        '200_2': (transaction, info = {}) => ({
            status: 1,
            message: 'Token validated successfully.',
            is_success: true,
            transaction_id: transaction,
            information: info,
            surf_code: '200_2',
        }),

        '200_3': (transaction, info = {}) => ({
            status: 1,
            message: 'Refresh token successfully.',
            is_success: true,
            transaction_id: transaction,
            information: info,
            surf_code: '200_3',
        }),

        '200_4': (transaction, info = {}) => ({
            status: 1,
            message: 'Logout successfully.',
            is_success: true,
            transaction_id: transaction,
            information: info,
            surf_code: '200_4',
        }),

        '200_5': (transaction, info = {}) => ({
            status: 1,
            message: 'Get decoded token data successfully.',
            is_success: true,
            transaction_id: transaction,
            information: info,
            surf_code: '200_5',
        }),

        '200_6': (transaction, info = {}) => ({
            status: 1,
            message: 'Monitoring records successfully found.',
            is_success: true,
            transaction_id: transaction,
            information: info,
            surf_code: '200_6',
        }),
    },

    error: {
        '400_1': (transaction) => ({
            status: 0,
            message: 'Username or password is required / invalid.',
            is_success: false,
            transaction_id: transaction,
            information: null,
            surf_code: '400_1',
        }),

        '400_2': (transaction) => ({
            status: 0,
            message: 'Header platform-access-uuid missed or invalid.',
            is_success: false,
            transaction_id: transaction,
            information: null,
            surf_code: '400_2',
        }),

        '400_3': (transaction) => ({
            status: 0,
            message: 'Refresh token missed.',
            is_success: false,
            transaction_id: transaction,
            information: null,
            surf_code: '400_3',
        }),

        '400_4': (transaction) => ({
            status: 0,
            message: 'JWT Token missed.',
            is_success: false,
            transaction_id: transaction,
            information: null,
            surf_code: '400_4',
        }),

        '401_1': (transaction) => ({
            status: 0,
            message: 'Invalid username or password.',
            is_success: false,
            transaction_id: transaction,
            information: null,
            surf_code: '401_1',
        }),

        '401_2': (transaction) => ({
            status: 0,
            message: 'Invalid Token.',
            is_success: false,
            transaction_id: transaction,
            information: null,
            surf_code: '401_2',
        }),

        '403_1': (transaction) => ({
            status: 0,
            message: 'Platform forbidden for this user.',
            is_success: false,
            transaction_id: transaction,
            information: null,
            surf_code: '403_1',
        }),

        '404_1': (transaction) => ({
            status: 0,
            message: 'Not found user.',
            is_success: false,
            transaction_id: transaction,
            information: null,
            surf_code: '404_1',
        }),

        '404_2': (transaction) => ({
            status: 0,
            message: 'Route not found.',
            is_success: false,
            transaction_id: require('uuid').v4(),
            information: null,
            surf_code: '404_2',
        }),

        '500_1': (transaction) => ({
            status: 0,
            message: 'Internal Server Error.',
            is_success: false,
            transaction_id: transaction,
            information: null,
            surf_code: '500_1',
        }),

        '500_2': (transaction) => ({
            status: 0,
            message: 'Error to manage refresh tokens.',
            is_success: false,
            transaction_id: transaction,
            information: null,
            surf_code: '500_2',
        }),

    },
};

module.exports = responses;
