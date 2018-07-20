var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASS
    }
});

var moment = require('moment');
moment.locale('fr');

module.exports = function (walks, users, cb) {

    // Generate text
    var text = `<h1>Résumé de la semaine</h1>`;

    // Get receivers list
    var receivers = [];
    users.forEach(function (el) {
        receivers.push(el.email);
    });

    // Send mail
    transporter.sendMail({
        from: `Découverto <${process.env.MAIL_AUTH_USER}>`,
        to: receivers.join(),
        subject: 'Statistiques Découverto: ' + moment().format('DD MMMM YYYY'),
        html: text
    }, function (err) {
        if (cb) {
            cb(err);
        }
    });
};