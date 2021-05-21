<script lang="js" frontend>
/**
* Display a simple User Avatar sourced from Gravatar.com
* @param {string} [url] Alternate URL to try BEFORE using Gravatar, if valid its return is used instead
* @param {Object} [user] The user object, takes precedence if present
* @param {string} [email] The users email
* @param {number|string} [size=32] The size, in pixels of the Avatar
* @param {string} [fallback='identicon'] Fallback style to use if the user doesn't have a registered icon. ENUM: 'mp', 'identicon', 'monsterid', 'wavatar', 'retro', 'robohash', 'blank'
* @param {string} [failIcon] URL to use if none of the above data matches - defaults to the 'power symbol' Gravatar fallback icon
*
* @see https://en.gravatar.com/site/implement/images/
*/
import {MD5} from 'jscrypto/es6/MD5';

app.component('userAvatar', {
	data() { return {
		imageUrl: undefined,
	}},
	props: {
		url: {type: String},
		email: {type: String},
		user: {type: Object},
		size: {type: [Number, String], default: 32},
		fallback: {type: String, default: 'identicon'},
		failIcon: {type: String, default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000'},
	},
	methods: {
		refresh() {
			return Promise.resolve()
				.then(()=> this.imageUrl = undefined)
				// Check if URL exists and is valid {{{
				.then(()=> {
					if (this.url) return this.$http.head(this.url)
						.then(res => {
							console.log('GOT HEAD', res);
						})
				})
				// }}}
				// Fallback to Gravatar on email || user.email {{{
				.then(()=> {
					var email = this.user?.email || this.email;
					if (!email) return // Not enough data - do nothing

					this.imageUrl = 'https://gravatar.com/avatar/'
						+ MD5.hash(email).toString()
						+ '?'
						+ `size=${this.size}&`
						+ `d=${this.fallback}`
					throw 'DONE';
				})
				// }}}
				// No other response had data - use failed icon {{{
				.then(()=> this.imageUrl = this.failIcon)
				// }}}
				// Catch (skip 'DONE') {{{
				.catch(e => {
					if (e === 'DONE') return;
					return this.$toast.catch(e);
				})
				// }}}
		},
	},
	created() {
		this.$watchAll(['url', 'user.email', 'email'], this.refresh, {immediate: true})
	},
});
</script>

<template>
	<div class="user-avatar">
		<div v-if="imageUrl === undefined" class="user-avatar-spinner far fa-spinner fa-spin"/>
		<img :src="imageUrl"/>
	</div>
</template>

<style lang="scss">
.user-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--light);
	border-radius: 50%;
	width: 32px;
	height: 32px;
	overflow: hidden;

	& .user-avatar-spinner {
		opacity: 0.5;
	}
}
</style>
