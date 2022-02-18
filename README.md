This is an API server meant to be a backend for issuing Verifiable Credentials

For dev use you'll need [node.js](https://nodejs.org/en/), [mkcert](https://github.com/FiloSottile/mkcert) and [docker-compose](https://docs.docker.com/compose/install/)

Configure SSL certs for the local docker instances, you should only have to do this once

1. Run `mkcert -install` to install a local CA
2. Generate SSL certs with `mkcert -cert-file ~/certs/127.0.0.1.nip.io.crt -key-file ~/certs/127.0.0.1.nip.io.key '*.127.0.0.1.nip.io'`
3. Run `echo export NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem" | tee -a ~/.bashrc ~/.zshrc && exec $0` to add the local CA to your environment

Now you can build and start the server by:

1. Build and start the server using `docker-compose up --build`, if you get an error that a port is in use you're probably already running a web server or db on your machine, you'll have to either stop it or adjust the ports used by this project in `docker-compose.override.yml`
2. As the server starts for the first time it will generate an admin token for you, note it down as it's not possible to retrieve it after this point
3. Once the server is up and running you can get to it's interactive documentation at https://credadmin.127.0.0.1.nip.io/api-docs/swagger
4. Click the `Authorize` button near the top of the page and enter `Bearer xyz` where `xyz` is the admin token you noted earlier

Configuration
=============

All configuration is done through environment variables.

|Variable            |Default   |Description                                  |
|--------------------|----------|---------------------------------------------|
|CA_DB_CONNECTION_URL|          |Database connection URL                      |
|CA_JWT_SECRET       |secret    |Secret used when signing JWTs for user auth  |
|OIDC_COMPARE        |sub       |OIDC userInfo field to compare to externalIds|
|OIDC_ISSUER_URL     |          |URL of OIDC server                           |
|OIDC_USERINFO_PATH  |/userinfo |Path to the userinfo endpoint of OIDC server |
|PORT                |3000      |Port to listen for http requests on          |
|PUBLIC_URL          |          |Publicly reachable URL for this server       |
|TEMPLATE_URL        |local://templates|URL to retrieve templates from using @tweedegolf/storage-abstraction"|
