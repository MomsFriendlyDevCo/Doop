<filter>
// TODO: Ability to specify units
module.exports = value => Number(value || 0).toLocaleString() + 'kg';
</filter>
