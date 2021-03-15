var dumper = require('dumper.js');
console.dump = (...args) => args.forEach(a => dumper.dump(a));
console.die = (...args) => { args.forEach(a => dumper.dump(a)) ; process.exit(1); };
