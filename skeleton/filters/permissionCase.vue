<filter>
/**
* Convert a camelCasePermission into `Camel > Case > Permission`
* @param {string} value The input string to process
* @returns {string} The formatted sting output
*/
module.exports = value => _.startCase(value).split(' ').map(word => `${word} >`).join(' ').replace(/ >$/, '');
</filter>
