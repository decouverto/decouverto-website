# decouverto-website

The main website of Découverto organization with the walks and the presentation of books...

You have to install **mongodb** to run this server.

## Configuration

You will have to create a `.env` file to configurate the mail service:
```dosini
MAIL_SERVICE=gmail
MAIL_AUTH_USER=example@gmail.com
MAIL_AUTH_PASS=password
```
You can use a lot of service as described [there](http://nodemailer.com/smtp/well-known/).
I use another GMail account to send me the data each week.
