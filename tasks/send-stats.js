var nodemailer = require('nodemailer');


var mailConf = {};

if (process.env.MAIL_SERVICE != 'ovh') {
    mailConf = {
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.MAIL_AUTH_USER,
            pass: process.env.MAIL_AUTH_PASS
        }
    }
} else {
    mailConf = {
        host: 'ssl0.ovh.net',
        port: 587,
        secure: false,
        auth: {
            user: process.env.MAIL_AUTH_USER,
            pass: process.env.MAIL_AUTH_PASS
        }
    }
}

var transporter = nodemailer.createTransport(mailConf);

var moment = require('moment');
moment.locale('fr');

module.exports = function (walks, users, cb) {

    // Generate text
    var text = '';
    var totalApp = 0;
    var totalWeb = 0;

    // Check if it is a replica
    var replica = '';
    if (process.env.IS_REPLICA) {
        replica = '[REPLICA] ';
    }

    walks.forEach(function (walk) {
        totalApp += walk.app;
        totalWeb += walk.web;
        if (walk.app == null) {
            walk.app = 'indisponible';
        }
        text += `<tr>
            <td style="padding: 8px;border: solid 1px black;">${walk.id}</td>
            <td style="padding: 8px;border: solid 1px black;">${walk.title}</td>
            <td style="padding: 8px;border: solid 1px black;">${walk.app}</td>
            <td style="padding: 8px;border: solid 1px black;">${walk.web}</td>
        </tr>`
    });
    
    text = `<h1>${replica}Stats de la semaine n° ${moment().format('W')} de ${moment().format('YYYY')}</h1>
    <table style="border-collapse: collapse;"><tbody>
    <tr style="background-color: #dc3133; font-weight:bold; font-size:1em; line-height:1.2em; color: #fff;">
        <th style="padding: 8px;border: solid 1px black;">Id</th>
        <th style="padding: 8px;border: solid 1px black;">Nom</th>
        <th style="padding: 8px;border: solid 1px black;">Téléchargement dans l'application (${totalApp})</th>
        <th style="padding: 8px;border: solid 1px black;">Aperçu sur Internet (${totalWeb})</th>
    </tr>${text}</tbody></table><p>Si un mail n'a pas été envoyé la semaine précédente, ce mail contient les statistiques de deux semaines.</p><p>À propos de la <a href="https://fr.wikipedia.org/wiki/Numérotation_ISO_des_semaines">numérotation des semaines</a>.</p>`;

    // Get receivers list
    var receivers = ['decouverto@yahoo.com'];
    users.forEach(function (el) {
        receivers.push(el.email);
    });

    // Send mail
    transporter.sendMail({
        from: `Découverto <${process.env.MAIL_AUTH_USER}>`,
        to: receivers.join(),
        subject: replica + 'Statistiques Découverto: ' + moment().format('DD MMMM YYYY'),
        html: text
    }, function (err) {
        if (cb) {
            cb(err);
        }
    });
};