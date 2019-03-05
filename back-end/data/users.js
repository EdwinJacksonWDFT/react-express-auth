const User = require('../models/user');

module.exports = [
    new User({
        username: 'lordfarquar',
        password: 'farfaraway',
        email: 'fionaisbae@farfaraway.com'
    }),
    new User({
        username: 'shrek',
        password: 'changeisgood',
        email: 'fionaisbae1@farfaraway.com'
    }),
    new User({
        username: 'donkey',
        password: 'youwillneverguess',
        email: 'cmonshrek@farfaraway.com'
    }),
]