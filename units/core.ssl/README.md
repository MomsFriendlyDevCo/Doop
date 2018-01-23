DOOP SSL Unit
=============
Doop unit to setup an SSL listener on port 443.

Required Files:
1. SSL Certificate file in `units/ssl/cert/fullchain.pem`
2. Private key file in `units/ssl/cert/privkey.pem`

As the above files are generally unique to the server, they should NOT be committed to the VCS (Git). There is a `.gitignore` file in this directory to ignore everything in `./cert/`. *Do not override this*.


Installation and Setup
----------------------

1. (Optional). Most Linux distros already ship with the `letsencrypt` package. To check this use:

	apt-cache policy letsencrypt

If there is no known package install the PPA via

	sudo add-apt-repository ppa:certbot/certbot


2. Install letsencrypt

	sudo apt-get install letsencrypt


3. Setup the certificate from the root of the site:

	sudo letsencrypt certonly --manual -d <DOMAIN>

4. Follow the instructions given. If prompted for an email address and you work for MFDC use `daemons@mfdc.biz`. If prompted to perform DNS verification either speak to [Matt](matt@mfdc.biz) or alter the DNS as instructed to insert your TXT records.

5. If this is single server setup (i.e. no subdomains) copy the `fullchain.pem` + `privkey.pem` files from `/etc/letsencrypt/live/<DOMAIN>` into `units/ssl/cert/`. Or alternatively make that directory accessible by the Node process and add the full paths to those files in the config object as `cert` + `key`
