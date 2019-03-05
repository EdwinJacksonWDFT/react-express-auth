const router = require('express').Router();
const Token = require('../utils/token');
const users = require('../data/users');

/**
 * route handler for login.
 * this checks the username/password combination 
 */
const login = (req, res) => {
    // get the username and password from the body
    const { username, password } = req.body;
    if (!req.body && !username && !password) {
        // if they don't exist, response with an error
        res.status(400).json({
            message: `you need to have a username and password in your request`
        });
    }
    
    // search for the user
    const foundUser = users.find(user => user.match(username, password));
    if (!foundUser) {
        // if no one is found, the password / username is incorrect
        res.status(400).json({
            message: `this username and password combination doesn't exist`
        });
    }

    // if we've made it this far
    // the username/password combination is correct and exists
    res.status(202).json({
        token: Token.create(foundUser)
    });
}

router.post('/', login);

module.exports = router;