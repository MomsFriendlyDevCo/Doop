<p align="center">
	<img src="https://github.com/MomsFriendlyDevCo/Doop/raw/master/assets/doop.png">
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
* [Doop command-line interface](https://github.com/MomsFriendlyDevCo/doop-cli)


Terminology:

* The Doop documentation endeavour to use requirement levels that abide by the definitions specified by [RFC 2119 (Requirement Levels)](http://www.ietf.org/rfc/rfc2119.txt)


General concept
===============
Doop is made up of two types of files. Files ending in `.vue` are front-end Vue framework(esk) and `.doop` are back-end Express framework(esk).

Within these two file types there can be blocks of code which expose things like controllers, schemas, models, CSS, HTML templates and so on.

Generally all areas of an application are exposed at the root level (e.g. `widgets/`) with shared components living inside directories such as `filters`, `widgets` and so on.


NPM modules
-----------
MFDC relies on various common NPM modules across all its projects.

You can read more about how MFDC structures its project in the [Momsronomicon](https://github.com/MomsFriendlyDevCo/Momsronomicon/blob/master/devstack-node.md).


Project directories and files
=============================
The project tree breakdown is listed below. For each path an 'edit chance' is given (i.e. the possibility of the developer needing to change the contents of that directory) and a brief description.

| Path or Glob                   | Description
|--------------------------------|----------------------------------
| `/`                            | The project root
| `/app/`                        | Core initialization files
| `/assets/`                     | Generic static assets such as logo images and favicons
| `/build/`                      | Build scripts
| `/cache/`                      | Generic cache handling
| `/config/index.js`             | Base config file showing default variables subsequently overridden by each `NODE_ENV` config file
| `/config/*.js`                 | Other config files, loaded selectively based on the `NODE_ENV` environment variable
| `/config/private.js`           | Private config details. This file is listed in `.gitignore` and should *never* be checked in to GitHub as it can contain private details - e.g. database connection passwords or API keys
| `/config/production.conf.js`   | Production server config details. This should include settings to enable all minimizers and other optimizations for production-ready code
| `/config/`                     | Storage for all config scripts read at startup, see `config/index.js` for default config setup. Other files are read depending on the `NODE_ENV` setting
| `/dashboard/`                  | Front end application entry point
| `/data/`                       | Generic data for the project - could contain resource files used during automated builds
| `/db/`                         | The main database driver and schema loader
| `/debug/`                      | Various debugging utilities
| `/directives/`                 | Shared front-end Vue directives
| `/dist/`                       | Generated files directory. Do not edit the contents of this directory as it is auto-generated by Gulp
| `/docs/`                       | Any miscellaneous files not relevant to the operation of the project but which need to be retained e.g. scope documents, ERD diagrams
| `/errors/`                     | Error handling and reporting
| `/filters/`                    | Shared front-end Vue filters
| `/fonts.fa5/`                  | Font-Awesome 5
| `/fonts/`                      | Other font files
| `/.git/`                       | Git storage and meta information
| `/gulpfile.js`                 | Main Gulp build-system config file
| `/**/*.gulp.js`                | Global Gulp build-system task files
| `/layouts/`                    | Global page layout templates
| `/layouts/main.html`           | Default page layout template
| `/middleware/db.*.doop`        | Database middleware
| `/middleware/`                 | Express and Database middleware
| `/middleware/express.*.doop`   | Express middleware
| `/node_modules/`               | Install directory for all NPM controlled packages
| `/scenario/`                   | Database scenario templates
| `/server/`                     | Server bootstrapping scripts
| `/services/`                   | Shared front-end Vue services (usually available as `vm.$SERVICE`)
| `/tests/`                      | Optional testing files
| `/theme/bootstrap-extensions/` | Various CSS files which extend Bootstrap@4
| `/theme/`                      | Site theme
| `/theme/theme-fixes/`          | Various CSS files which fix issues with the main theme
| `/users`                       | User schemas and management
| `/vendors`                     | Externally supported vendor scripts
| `/widgets`                     | Shared front-end Vue services


Blocks
======

Back-end .doop files
--------------------
Doop backend files are made of code blocks which execute when a named event is emitted (via `app.emit(event)`). For convenience some aliases are present which makes typing a little less tedious:

| Block      | Alias of                  | Definition             |
|------------|---------------------------|------------------------|
| `endpoint` | `<server on="endpoints">` | An API endpoint
| `server`   |                           | Sever level code block |
| `schema`   | `<server on="schemas">`   | A database schema      |


For the `server` block the `on` event must be specified and can contain a CSV of multiple events.

For a reference of which events fire and in what order see the [server](./server/index.js) and [gulpfile](./gulpfile.js).


Front-end .vue files
--------------------
In addition to the regular Vue [Single-Page-Component](https://vue-loader.vuejs.org/spec.html) other block types are also supported:

| Block       | Contents                   | Definition                                                                                                               |
|-------------|----------------------------|--------------------------------------------------------------------------------------------------------------------------|
| `component` | JavaScript function export | A global Vue component                                                                                                   |
| `directive` | JavaScript function export | A global Vue directive                                                                                                   |
| `filter`    | JavaScript function export | A global Vue filter (note that `v-` prefix is not required in the filename but is required when using within a template) |
| `import`    | Text                       | A list of JavaScript and CSS files to include inline, one per line                                                       |
| `macgyver`  | JavaScript function export | A [Macgyver](https://github.com/MomsFriendlyDevCo/macgyver) component definition                                         |
| `script`    | JavaScript                 | Global level JavaScript injection                                                                                        |
| `service`   | JavaScript function export | A global Vue service - accessible via `vm.$service`                                                                      |
| `style`     | CSS                        | Global level CSS                                                                                                         |
| `template`  | HTML                       | Template file (the file name is used to match it against the controller)                                                 |


**Notes:**
* Any item listed as "JavaScript function export" is required to export a function via `module.exports = ...` to be valid.
* Names of exported items (such as components, filters, services and templates) are all automatically derive from the filename and transformed via CamelCase.  The name can be overridden by specifying the name attribute e.g. `<service name="myService"/>` to export as `vm.$myService`.
* Services are accessible via either `vm.$service` or `Vue.services().service`


API
===

Back-end
--------
Doop is exposed as a global level `app` object which contains the following functions:


app
---
The App object is a global, available everywhere in the project. It is a mutated version of the [ExpressJS App object](http://expressjs.com/en/4x/api.html#app) and [eventer](https://github.com/MomsFriendlyDevCo/eventer) classes.


app.cache
---------
Globally available instance of [Generic-Cache](https://github.com/MomsFriendlyDevCo/generic-cache)


app.config
----------
An object used to hold the calculated contents of the `/config` files. This is typically a combination of the main `index.js` file, any `NODE_ENV` specific files and the `private.js` file. To see the config of the profile you are currently using run `gulp app.config`.


app.db OR db
------------
In a typical Doop deployment this object represents an object of all loaded models. This may not be the case in all projects, depending on the database driver used.

`db` is also registered as a global for convenience.


app.emit(event, args...)
------------------------
Emit an event using [eventer](https://github.com/MomsFriendlyDevCo/eventer).


app.log()
---------
Various logging functionality. Try to use `app.log()` instead of `console.log()` as text output via it is properly prefixed to the running file name.


app.log.colors
--------------
Globally available version of [Chalk](https://github.com/chalk/chalk).


app.log.dump(...msg)
--------------------
Globally available version of [dumper.js](https://github.com/ziishaned/dumper.js)


app.log.debug(...msg)
---------------------
Globally available version of [debug](https://github.com/visionmedia/debug)


app.log.error(Error)
--------------------
Globally available version of [Crash](https://github.com/MomsFriendlyDevCo/crash).
Use `app.log.errorCrash(Error)` to perform a fatal error.


app.middleware
--------------
In a typical Doop deployment this object represents an object of available middleware. Use `app.middleware.express` or `app.middleware.db` for the Express and database middlewares respectively.


app.on(event, handler)
----------------------
Register an event listener using [eventer](https://github.com/MomsFriendlyDevCo/eventer).



Differences
===========
The Doop framework tries to keep as close to the Vue (front-end) and Express (back-end) frameworks as possible but in some cases there are differences in behaviour.


Differences from standard Vue
-----------------------------

* All `<service/>` blocks are automatically registered against `vm` (i.e. `this` inside a component or service)
* Components have a `route` string property which is automatically registered with the router
* Recursive (infinite emitters) are available via `vm.$emit.up(event, ...params)`, `vm.$emit.down(event, ...params)` and omni-directional as `vm.$emit.broadcast(event, ...params)`
* Watching a group of local properties (but only firing *once*) is available via `vm.$watchAll(props[], callback, options)`


Syntax highlighting for Visual Studio
-------------------------------------

1. Install Visual Studio Code
2. Press `Ctrl + Shift + X` to view extensions and install the `Vetur` plugin
3. Go to the Vetur config page and click `Vetur > Grammar > Custom Blocks` ("Edit in settings.json")
4. Paste the following into the `settings.json` file that opens:

```json
{
    "files.associations": {
        "*.doop": "vue"
    },
    "vetur.grammar.customBlocks": {
        "endpoint": "js",
        "component": "js",
        "directive": "js",
        "filter": "js",
        "macgyver": "js",
        "schema": "js",
        "server": "js",
        "service": "js"
    },
    "vetur.format.options.useTabs": true,
    "editor.insertSpaces": false,
    "vetur.format.options.tabSize": 4
}
```

5. Press `Ctrl + Shift + P` then select `Vetur: Generate Grammar from ...`
6. Reload VSCode


Importing front-end resources
-----------------------------
There are three major methods to import external resources into a Doop frontend project:


1. **Import via CommonJS** - This is the fastest, most atomic and easiest to transpile

Include external resources within `<import/>` tags. Include other initialization scripts within `<script/>` tags.

```javascript
<import>
./node_modules/node-waves/dist/waves.min.js
</import>

<script>
window.Waves.init();
</script>
```


2. **Import via ES6 syntax** - This is 'prettiest' and most modern at the expense of being the slowest due to its web of dependency resolution

Include all ES6 syntax within `<script repack/>` tags. The code is resolved by Rollup and compiled into one large dependency graph. Other external resources can be resolved with `<import/>` tags if needed.

```javascript
<script repack>
import ToggleButton from 'vue-js-toggle-button';
Vue.use(ToggleButton);
</script>
```


Testing + Debugging
===================

Unit tests
----------
Larger projects can populate the `/tests/` directory with [Mocha](https://mochajs.org) + [Chai](http://chaijs.com/api/bdd) test cases. Tests can also be specified per-unit by adding any file matching the glob `*.test.js` within their unit directory.

To run a Unit test you will need to have Mocha installed (`sudo npm i -g mocha`). Either run mocha with no specified files to process *all* test files or specify the specific test file(s) you wish Mocha to examine as command line arguments.

Run the *all* the tests with mocha in the project root directory with `mocha`.

**TIP:** Unit tests can be skipped temporarily by either adding an 'x' before `describe` / `it` or adding `.skip` as a suffix. e.g. To temporarily skip a test rename the function `describe('something something')` to `xdescribe('something something')` or `describe.skip('something something')`.
**TIP::** As with the above you can also force Mocha to *only* run one test - this is useful if your test is deeply nested within an existing file and you don't want to add `skip` to each other case. To use this add `.only` as a suffix for the `describe` / `it` declaration. e.g. `it('should do this', function() { ... })` becomes `it.only('should do this', function() { ... })`.


Command line debugging
----------------------
Doop, like most modules, responds to the `DEBUG` flag used by the [Debug](https://github.com/visionmedia/debug) module. This turns on verbose logging when running within a console.
The `DEBUG` variable can be set to the specific module you would like to log, a number of them via comma-separated-values or a glob expression. For example `DEBUG=doop gulp` runs Gulp and tells Doop to run in debug mode.

Some tips:
* For internal problems with Doop (such as issues with load order, hooks or other structural issues) set `DEBUG=doop` before running. e.g. `DEBUG=doop gulp` when running within Doop.
* For async related issues set [Async-Chainables debug flag](https://github.com/hash-bang/async-chainable#debugging). e.g. `DEBUG=async-chainable gulp`
* For database related issues set Monoxides debug flag. e.g. `DEBUG=monoxide`. This can be especially useful when debugging why Monoxide (the Doop ReST handler) didn't perform a certain action such as creating a record.
