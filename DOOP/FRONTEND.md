Doop
====
[Doop index](README.md)

You are currently viewing the Doop Front-end reference. [Click here for the back-end reference](BACKEND.md). Below are concepts within Doop that relate specifically to the front-end (i.e. the AngularJS, browser based UI)


Front-end units
==============
Can be composed of files with the following suffixes:

* **.ctrl.js** - Front-end controller file. This controller should keep with the MVC pattern, manipulating the model, which Angular will then update the view with. Ideally, the controller so NOT know HOW to fully query the app's API to retrieve/store data. Rather it should be using a relevant data service for these kinds of operations.
* **.modl.js** - Any model definitions. These would normally tell the app where the applicable model ReST API is.
* **.serv.js** - Service files. These are singletons that can be used across multiple controllers.
* **.dirv.js** - Angular directive definitions. If your app needs to directly manipulate the DOM, use a directive.
* **.comp.js** - Angular component definitions. If your app has a need for a simple widget that doesn't directly manipulate DOM, use a component.
* **.fltr.js** - Angular filter definitions. These are custom filters that your app requires.
* **.tmpl.html** - Angular template files. These are where the bulk of your app's HTML will go. These are partials, so they should NOT be complete HTML files (e.g. containing a `<html>`, `<head>`, `<body>`, etc.) -- leave that to the server-side layout / page files.


[Back to main DOOP reference](README.md)
