Doop
====
[Doop index](README.md)

You are currently viewing the Doop Front-end reference. [Click here for the back-end reference](BACKEND.md). Below are concepts within Doop that relate specifically to the front-end (i.e. the AngularJS, browser based UI)


Front-end units
==============
Can be composed of files with the following suffixes:

* **.ctrl.js** - Front-end controller file. This controller should keep with the MVC pattern, manipulating the model, which Angular will then update the view with. Ideally, the controller so NOT know HOW to fully query the app's API to retrieve/store data. Rather it should be using a relevant data service for these kinds of operations.
* **.modl.js** - Any model definitions. These would normally tell the app where the applicable model ReST API is. Typically this is expected to be created as an Angular `.factory(...)`.
* **.serv.js** - Service files. These are singletons that can be used across multiple controllers. Typically this is expected to be created as an Angular `.service(...)`.
* **.dirv.js** - Angular directive definitions. If your app needs to directly manipulate the DOM, use a directive.
* **.comp.js** - Front-end component definitions. If your app has a need for a simple widget that doesn't directly manipulate DOM, use a component.
* **.fltr.js** - Angular filter definitions. These are custom filters that your app requires.
* **.tmpl.html** - Front-end template files. These are where the bulk of your app's HTML will go. These are partials, so they should NOT be complete HTML files (e.g. containing a `<html>`, `<head>`, `<body>`, etc.) -- leave that to the server-side layout files.
* **.rout.js** - Angular route definitions. Typically these may sit within a unit to expose the available routes/states for that unit.
* **.conf.js** - Front-end configuration files. These files should not do anything else other than specify a configuration for an app/unit, if required.

Style Guide
===========
*TL;DR = Keep your code short and sweet, be consistent, and maintain a good separation of concerns.*

Please adhere to the following basic guidelines:

* No need to wrap front end script/files in an IIFE UNLESS you are doing things OUTSIDE Angular
* Follow 1TBS style
* Always avoid adding to global scope (e.g. `window`) where possible
* USE `$resource` as much as possible NOT `$http`
* Avoid creating SUB-UNITS. Remember, units are intended to be interchangable between projects as much as possible
* If you're directly manipulating the DOM, create a directive. NEVER do it in the controller
* Keep your controllers short and sweet; delegate to services where necessary
* CASCADE your project's themes: `units/themeDark` overrides `units/theme`
* Terminate your statements with a statement terminator (`;`)
* Declare inline object literals with a space: e.g. `{ foo: 'bar' }`
* Declare your function with a space after the parentheses: e.g. `function() { ... }`
* Top level function expressions/declarations (e.g. controllers, services, etc.) MUST be declared with the normal function syntax.
* First-class functions (those passed as arguments to other functions) SHOULD be declared using ES6 Arrow Function Syntax.


[Back to main DOOP reference](README.md)
