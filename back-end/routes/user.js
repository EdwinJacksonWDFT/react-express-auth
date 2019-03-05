const router = require('express').Router();
const Token = require('../utils/token');
const isAuthenticated = require('../middleware/token');

router.use(isAuthenticated);

router.get('/settings', (req, res) => {
    res.json(res.locals.user);
});


module.exports = router;