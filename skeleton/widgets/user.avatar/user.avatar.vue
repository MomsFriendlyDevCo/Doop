<script lang="js" frontend>
/**
* Display a simple User Avatar sourced from Gravatar.com
* @param {string} [url] Alternate URL to try BEFORE using Gravatar, if valid its return is used instead
* @param {Object|string} [user] The user object or ID, takes precedence if present the user data is fetch if not already present in the $digest cache
* @param {string} [email] The users email
* @param {number|string} [size=32] The size, in pixels of the Avatar
* @param {string} [fallback='identicon'] Fallback style to use if the user doesn't have a registered icon. ENUM: 'mp', 'identicon', 'monsterid', 'wavatar', 'retro', 'robohash', 'blank'
* @param {string} [failIcon] URL to use if none of the above data matches - defaults to the 'power symbol' Gravatar fallback icon
* @param {string} [overlay] Optional overlay effect to apply. ENUM: 'mask'
*
* @param {boolean} [editable=false] Allow uploading a replacement image over the avatar
* @param {string} [editablePost='/api/session/avatar'] Post path to send the editable URL to
* @param {boolean} [editableUploadedRefresh=true] Attempt to reload avatar content after upload
* @param {boolean} [editableUploadedRefreshUrl] Attempt to refresh all <user-avatar/> elements with the same `url` property
*
* @see https://en.gravatar.com/site/implement/images/
*/
import {MD5} from 'jscrypto/es6/MD5';

app.component('userAvatar', {
	data() { return {
		imageUrl: undefined,
		tooltip: undefined,
	}},
	props: {
		url: {type: String},
		email: {type: String},
		user: {type: [Object, String]},
		size: {type: [Number, String], default: 32},
		fallback: {type: String, default: 'identicon'},
		failIcon: {type: String, default: 'https://gravatar.com/avatar/00000000000000000000000000000000'},
		overlay: {type: String},

		editable: {type: Boolean, default: false},
		editablePost: {type: String, default: '/api/session/avatar'},
		editableUploadedRefresh: {type: Boolean, default: true},
		editableUploadedRefreshUrl: {type: Boolean, default: true},
	},
	methods: {
		refresh() {
			return Promise.resolve()
				.then(()=> this.imageUrl = this.tooltip = undefined)
				// Use user (object or data) if present {{{
				.then(()=> {
					if (!this.user) return; // No user data present
					return Promise.resolve()
						.then(()=> {
							if (_.isString(this.user)) { // Is raw ID - need to fetch user
								return this.$digest.get(`/api/users/${this.user}`)
							} else {
								return this.user;
							}
						})
						.then(user => {
							this.tooltip = user.name + (user.company ? `<br/>${user.company}` : '');
						})
				})
				// }}}
				// Check if URL exists and is valid {{{
				.then(()=> {
					if (this.url) return this.$http.head(this.url)
						.then(res => {
							console.log('USE URL', this.url);
							this.imageUrl = this.url;
							throw 'DONE';
						})
						.catch(e => {
							if (e === 'DONE') throw e;
							return; // Carry on trying to find a valid avatar
						})
				})
				// }}}
				// Fallback to Gravatar on email || user.email {{{
				.then(()=> {
					if (!this.email) return; // Not enough data - do nothing

					this.imageUrl = 'https://gravatar.com/avatar/'
						+ MD5.hash(this.email).toString()
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

		upload() {
			if (!this.editable) return;
			return this.$files.upload({
				url: this.editablePost,
				multiple: false,
			})
				.then(()=> this.editableUploadedRefresh && this.refresh())
				.then(()=> this.editableUploadedRefreshUrl && this.$components.tell('userAvatar', component => {
					if (component === this) return; // Ignore this component
					if (component.$props?.url == this.url) return component.refresh(); // URL matches - refresh
				}))
				.catch(this.$toast.catch);
		},
	},
	created() {
		this.$watchAll(['url', 'user.email', 'email'], this.refresh, {immediate: true})
	},
});
</script>

<template>
	<div
		class="user-avatar"
		:class="editable && 'editable'"
		:style="{width: `${size}px`, height: `${size}px`}"
		v-tooltip="tooltip"
		@click.prevent.stop="upload"
	>
		<div v-if="imageUrl === undefined" class="user-avatar-spinner far fa-spinner fa-spin"/>
		<div v-else>
			<i v-if="overlay == 'mask'" class="overlay-mask fas fa-mask fa-lg"/>
			<img :src="imageUrl" :style="{width: size, height: size}"/>
		</div>
	</div>
</template>

<style lang="scss">
.user-avatar {
	/* width + height populated in element props by Vue template */
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--light);
	border-radius: 50%;
	overflow: hidden;
	position: relative;
	margin: auto;

	/* Image area {{{ */
	& img {
		width: 100%;
		height: 100%;
	}
	/* }}} */

	/* Editable {{{ */
	&.editable {
		cursor: pointer;

		/* Upload prompt {{{ */
		&:hover::after {
			visibility: visible;
		}

		&::after {
			visibility: hidden;
			display: flex;
			background: #eeed;
			content: "Upload...";
			position: absolute;
			justify-content: center;
			align-items: center;
			border-radius: 10px;
			padding: 5px;
		}
		/* }}} */
	}
	/* }}} */

	& .user-avatar-spinner {
		opacity: 0.5;
	}

	& .overlay-mask {
		position: absolute;
		top: 5px;
		text-align: center;
		width: 100%;
	}
}
</style>
