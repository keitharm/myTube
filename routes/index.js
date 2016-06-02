var express  = require('express');
var fs       = require('fs');
var router   = express.Router();

// Login //
router.get('/videos', function(req, res, next) {
  Video.find({}, function(err, docs) {
    res.send(docs);
  });
});

module.exports = router;