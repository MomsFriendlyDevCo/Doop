<script lang="js" frontend>
/**
* Display a simple User Avatar sourced from Gravatar.com
* @param {Object} [user] The user object, takes precedence if present
* @param {string} [email] The users email
* @param {number|string} [size=32] The size, in pixels of the Avatar
* @param {string} [fallback='identicon'] Fallback style to use if the user doesn't have a registered icon. ENUM: 'mp', 'identicon', 'monsterid', 'wavatar', 'retro', 'robohash', 'blank'
*
* @see https://en.gravatar.com/site/implement/images/
*/
import {MD5} from 'jscrypto/es6/MD5';

app.component('userAvatar', {
	props: {
		email: {type: String},
		user: {type: Object},
		size: {type: [Number, String], default: 32},
		fallback: {type: String, default: 'identicon'},
	},
	computed: {
		url() {
			var email = this.user?.email || this.email;
			if (!email) { // Not enough data - do nothing
				return;
			} else {
				return 'https://gravatar.com/avatar/'
					+ MD5.hash(email).toString()
					+ '?'
					+ `size=${this.size}&`
					+ `d=${this.fallback}`
			}
		},
	},
});
</script>

<template>
	<img
		v-if="url"
		:src="url"
		alt="user-image"
		class="rounded-circle"
	/>
</template>
