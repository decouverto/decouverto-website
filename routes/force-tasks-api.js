var express = require('express');
var path = require('path');
var router = express.Router();
var auth = require('../policies/auth.js');
var getFirstPoints = require('decouverto-get-all-first-point');


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


/* GET update map */
router.get('/update-map', auth, function (req, res, next) {
  getFirstPoints.write(path.resolve(__dirname, '../walks/first-points.json'), function (err) {
    if (!err) {
      res.json({ status: true });
    } else {
      console.error(err);
      next(err);
    }
  })
});

module.exports = router;