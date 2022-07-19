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
or
```dosini
MAIL_SERVICE=ovh
MAIL_AUTH_USER=example@decouverto.fr
MAIL_AUTH_PASS=password
```

You can use a lot of service as described [there](http://nodemailer.com/smtp/well-known/).
I use another GMail account to send me the data each week.

### Config for replica server

Just add this line
```dosini
IS_REPLICA=true
```


### MacOS 

In order to start mongodb just use:
```
brew services start mongodb-community
```

## [Docker](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

Build image:
```
docker build . -t cedced19/decouverto-website
```

Run image:
```
docker run -p 49160:8080 -d cedced19/decouverto-website
```

Get container ID and logs:
```
docker ps
docker logs <container id>
```