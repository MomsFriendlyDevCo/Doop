* Vue@3 no longer accepts global level components (e.g. `Vue.component(id, spec)`) all components must now be registered against the app global (`app.component(id, spec)`)
* `<service/>` -> `app.service('$serviceName', spec)`
* `<component/>` -> `app.component([id], spec)` (`ID` is not required if the component has a route)
