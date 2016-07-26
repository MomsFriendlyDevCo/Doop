<p align="center">
	<img src="https://github.com/MomsFriendlyDevCo/Doop/raw/master/DOOP/assets/doop.png">
</p>
<br><br>

Doop!
=====
The MEAN micro-framework used by [MomsFriendlyDevCo](http://mfdc.biz).

**If we hit that bullseye, the rest of the dominoes will fall like a house of cards. Checkmate - Zapp Brannigan**


Basic principles:

* Doop tries to have the lowest understanding cost possible
* Doop units are designed to be as generic and transferable between projects as possible


References:

* [Doop back-end reference](BACKEND.md)
* [Doop front-end reference](FRONTEND.md)


General concept
===============

Units
-----
A Doop Unit is a generic interchangeable collection of controllers, models, templates and other resources used by one system entity.

These are stored both in `/app/units` and `/server/units` if for [front-end](FRONTEND.md) or [back-end](BACKEND.md) respectively.


Project layout
==============
The project tree breakdown is listed below. For each path an 'edit chance' is given (i.e. the possibility of the developer needing to change the contents of that directory) and a brief description.


| Path or Glob                        | Description |
|-------------------------------------|-------------|
| `/`                                 | The project root |
| `/app/`                             | Front-end resources directory |
| `/build/`                           | Generated files directory |
| `/data/`                            | Generic data for the project - could contain resource files used during automated builds |
| `/docs/`                            | Any miscellaneous files not relevant to the operation of the project but which need to be retained e.g. scope documents, ERD diagrams |
| `/gulpfile.js`                      | Main Gulp build-system config file |
| `/gulp/*.gulp.js`                   | Global Gulp build-system task files |
| `/node_modules/`                    | Install directory for all NPM controlled packages |
| `/server/`                          | Back-end resources directory |
| `/server/config/`                   | Storage for all config scripts read at startup, see `/server/config/index.conf.js` for default config setup. Other files are read depending on the `NODE_ENV` setting |
| `/server/config/index.conf.js`      | Base config file showing default variables subsequently overridden by each `NODE_ENV` config file |
| `/server/config/production.conf.js` | Production server config details. This should include settings to enable all minimizers and other optimizations for production-ready code |
| `/server/config/private.conf.js`    | Private config details. This file is listed in `.gitignore` and should *never* be checked in to GitHub as it can contain private details - e.g. database connection passwords or API keys |
| `/server/units/`                    | Directory of all project units. See [Units](#units) for more information |
| `/server/units/**/*.ctrl.js`        | Controllers loaded during the controller loading stage. See [Back-end hooks](#back-end-hooks) |
| `/server/units/**/*.gulp.js`        | Gulp files included into the gulp setup by individual units |
| `/server/units/**/*.modl.js`        | Models loaded by the DB unit. See [Back-end hooks](#back-end-hooks) |
| `/server/units/**/*.serv.js`        | Services loaded during the service loading stage. See [Back-end hooks](#back-end-hooks) |
| `/server/units/layouts/*.html`      | Main layout template files |
| `/server/units/layouts/main.html`   | Default layout template file to use unless specified in server controller |
| `/server/units/scenarios/`          | Sample population data for all models, created by [Mongoose-Scenario](https://github.com/hash-bang/Node-Mongoose-Scenario). Each sub-directory should correspond with a scenario build profile with `defaults` being the default |
| `/server/units/scenarios/defaults/` | The default scenario file to use when no other is specified. The contents of this directory are processed when running `gulp db` |
| `/tests/`                           | Optional testing files |
