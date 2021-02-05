HOW TO CLONE THIS REPO
======================

* Grep for and correct all matches of `FIXME`
* Delete this note from the top of the README.md file
* Place your logos in `assets/logo`
* Generate Favicons using https://realfavicongenerator.net into `assets/favicons`



{{FIXME:Title}}
================
{{FIXME:Description}}


Installation
------------

1. Clone the repo:

```
git clone git@github.com:MomsFriendlyDevCo/{{FIXME}}.git
cd {{FIXME:Basename}}
```


2. Install all NPM dependencies:

```
npm ci
```


3. Build a prototype database:

```
gulp db
```


4. Run as a development server:

To execute the server in 'watchful mode' (i.e if you update a file the server will auto-restart):

```
gulp
```

