HOW TO CLONE THIS REPO
======================

* Grep for and correct all matches of `FIXME`
* Delete this note from the top of the README.md file
* Place your logos in `assets/logo`
* Generate Favicons using https://realfavicongenerator.net into `assets/favicons`



{{FIXME: Title}}
================
{{FIXME: Description}}


Deploy/Test Proceedure
----------------------

1. Ensure current `master` branch passes tests

```
npm run cypress:run
```

2. Merge tested `master` to `stable`

```
git checkout master && git pull
git checkout stable && git pull
git merge --no-ff master
```

3. Re-test `stable` to ensure all merges are functional

```
npm run cypress:run
```

4. Deploy `stable`

```
ssh user@server
./deploy-{{FIXME}}
```

Installation
------------

1. Clone the repo:

```bash
git clone git@github.com:MomsFriendlyDevCo/{{FIXME}}.git
cd {{FIXME:Basename}}
```


2. Install all NPM dependencies:

```bash
npm ci
```


3. Build a prototype database:

```bash
npm run sample:data
```


4. Run as a development server:

To execute the server in 'watchful mode' (i.e if you update a file the server will auto-restart):

```bash
npm run dev
```
