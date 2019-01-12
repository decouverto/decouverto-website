var express = require('express');
var router = express.Router();
var auth = require('../policies/auth.js');

/* GET stats */
router.get('/stats-mail', auth, function (req, res, next) {
    req.app.models.users.find().exec(function (err, users) {
        if (!err) {
          users.forEach(function (user) {
            delete user.password;
          });
          require('../tasks/send-stats')(req.app.generateStats(), users, function (err) {
            if (!err) {
                req.app.stats.purge(function (err) {
                    res.json({ status: true });
                });
            } else {
                console.error(err);
                next(err);
            }
          });
        }
      });
});

module.exports = router;