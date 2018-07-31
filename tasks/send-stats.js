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
    var text = `<h1>Stats de la semaine n° ${moment().format('W')} de ${moment().format('YYYY')}</h1>
    <table style="border-collapse: collapse;"><tbody>
    <tr  style="background-color: #dc3133; font-weight:bold; font-size:1em; line-height:1.2em; color: #fff;">
        <th style="padding: 8px;border: solid 1px black;">Id</th>
        <th style="padding: 8px;border: solid 1px black;">Nom</th>
        <th style="padding: 8px;border: solid 1px black;">Téléchargement dans l'application</th>
        <th style="padding: 8px;border: solid 1px black;">Aperçu sur Internet</th>
    </tr>`

    walks.forEach(function (walk) {
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
    text += `</tbody></table><p>Si un mail n'a pas été envoyé la semaine précédente, ce mail contient les statistiques de deux semaines.</p><p>À propos de la <a href="https://fr.wikipedia.org/wiki/Numérotation_ISO_des_semaines">numérotation des semaines</a>.</p>`;

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