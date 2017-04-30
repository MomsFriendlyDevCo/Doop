DOOP SSL Unit
=============
* Doop unit to setup an SSL listener on port 443.

Required Files:
1. SSL Certificate file in `units/ssl/cert/fullchain.pem`
2. Private key file in `units/ssl/cert/privkey.pem`

As the above files are generally unique to the server, they should NOT be committed to the VCS (Git). There is a `.gitignore` file in this directory to ignore everything in `./cert/`. *Do not override this*.


Installation and Setup
----------------------

1. (Possibly optional). Most Linux distros already ship with the `letsencrypt` package. To check this use:

	apt-get policy letsencrypt

If there is no known package install the PPA via

	sudo add-apt-repository ppa:certbot/certbot


2. Install letsencrypt

	sudo apt-get install letsencrypt


3. Setup the certificate from the root of the site:

	sudo letsencrypt certonly --webroot -w ./units/ssl/cert -d <DOMAIN>
