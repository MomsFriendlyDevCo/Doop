Promise.isPromiseLike = item => _.isFunction(item.then) || _.isFunction(item.catch);
