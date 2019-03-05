const Token = require('../utils/token');
const secret = require('../utils/secret');

// This handler will check for, and validate, a token on the authorization header
module.exports = (req, res, next) => {
    const { authorization } = req.headers;

    // if there is no token, reject
    if (!authorization) {
        res.status(401).json({
            message: 'you are not logged in'
        })
    }

    // validate the token, and save it to locals
    res.locals.user = Token.verify(authorization, () => {
        res.status(401).json({
            message: 'unable to validate identity'
        });
    });
    // move on if we're all good.
    next();
}