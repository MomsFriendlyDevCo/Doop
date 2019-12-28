<filter>
module.exports = value => Number(value || 0).toLocaleString('en-AU', {style: 'currency', currency: 'AUD'});
</filter>
