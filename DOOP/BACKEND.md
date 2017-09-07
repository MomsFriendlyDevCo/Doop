Doop
====
[Doop index](README.md)

You are currently viewing the Doop Back-end reference. [Click here for the front-end reference](FRONTEND.md). Below are concepts within Doop that relate specifically to the back-end (i.e. the NodeJS server side).


Back-end units
==============
Can be composed of files with the following suffixes:

* **.path.js** - Back-end route path definition file. This is a simple `require()'d` include during the controller processing phase. It has access to the `app` object which is usually mutated via `app.get()`, `app.post()` etc. Think of path definition files as a simple concat of all matching files at the end of the server load process to set up routes.
* **.gulp.js** - Gulp task files. Since gulp auto-resolves dependencies these can call on any of Gulps pre-defined tasks as prerequisites.
* **.schm.js** - Any schema models defining data types. The format of these files differs based on the database driver being used. In most cases this will be a [Monoxide Schema](https://github.com/hash-bang/Monoxide#schema-setup).
* **.scenario.json** - Scenario database builder files
* **.hook.js** - Service hook files. These are the equivalent of complex controllers which should *have no side-effects when loaded*. Each service should instead hook into a process via `app.register()` calls to insert its behaviour into the correct load sequence position. Services are loaded before controllers and are available as-early-as-possible during the load sequence.
* **.conf.js** - Back-end configuration file.


Hooks
-----
Services register their intent via a call to `app.register()` against a named hook.

Hooks can be custom defined within the application but the built-ins used during the load process are, in-order:

1. `init`
2. `preModels` - only used if the database driver is Monoxide
3. `postModels` - only used if the database driver is Monoxide
4. `preControllers`
5. `postControllers`
6. `preServer`
7. `postServer`
8. `postFinish` - Fired when absolutely everything has finished



API
----
Doop provides some exceptionally minimal base API listed in the following sub-sections.

For the [front-end API click here](FRONTEND.md).


app
---
The App object is a global, available everywhere in the project. It is a muted version of the [ExpressJS App object](http://expressjs.com/en/4x/api.html#app).


app.register()
--------------
```javascript
app.register(hook, prerequisites, function)
```

The `app.register()` function is called by services to setup a event listener for a place within the server load sequence.

The ID of each unit is taken from the directory name (e.g. `/server/units/fooBarBaz/myService.serv.js` has the ID `fooBarBaz`). Prerequisites can be specified as a string or an array of units which should be loaded *before* this unit can be executed.


app.fire()
----------
```javascript
app.fire(hook)
```

The `app.fire()` function is used by the main server load process to execute hooks registered during an `app.register()` call.


app.config
----------
An object used to hold the calculated contents of the `/server/config` files. This is typically a combination of the main `index.conf.js` file, any `NODE_ENV` specific files and the `private.conf.js` file. To see the config of the profile you are currently using run `gulp config`.


app.db OR db
------------
In a typical Doop deployment this object represents an object of all loaded models. This may not be the case in all projects, depending on the database driver used.

`db` is also registered as a global for convenience.


app.middleware
--------------
In a typical Doop deployment this object represents an object of available middleware which can be applied into Express routes.


app.getUnit()
-------------
```javascript
app.getUnit(path)
```
Populate a units information from one file within its path.

This will return an object composed of the following keys. In each case the sample path `/server/units/fooBarBaz/foobarBaz.modl.js` is used:

| Key         | Example result                | Description                                           |
|-------------|-------------------------------|-------------------------------------------------------|
| `id`        | `fooBarBaz`                   | The ID of the unit                                    |
| `shortName` | `fooBarBaz/fooBarBaz.modl.js` | The ID + the filename of the currently processed item |


app.unit
--------
An object structure available when loading a unit. This is primarily used to determine the name, ID and other assorted information of a unit.

See `app.getUnit()` for information on how this is determined.


[Back to main DOOP reference](README.md)
