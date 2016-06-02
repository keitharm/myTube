var notify = require('gulp-notify');

module.exports = function(err) {
    notify.onError({
        message: "<%= error.message %>"
    }).apply(this, arguments);

    this.emit('end');
};
