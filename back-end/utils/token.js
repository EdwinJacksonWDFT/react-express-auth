const jwt = require('jsonwebtoken');
const secret = process.env.SECRET || require('./secret');

module.exports = class {

    static create(user, expiry) {
        return jwt.sign({...user}, secret, { expiresIn: expiry || 600 });
    }

    static verify(token, errorCallback) {
        let payload = {};
        try {
            payload = jwt.verify(token, secret);
        } catch (error) {
            console.log(error);
            errorCallback();
        }
        return payload;
    }

    static payload(token) {
        jwt.decode(token, (error, payload) => {
            if (error) {
                return error;
            }
            return payload;
        })
    }
}