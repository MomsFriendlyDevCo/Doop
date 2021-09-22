<script lang="js" frontend>
/**
* Extremely simple component which fetches a single point of data from the server and displays it
* EITHER the collection + ID OR the url must be specified
* If the return value from the server is an array the first item in the array is assumed to be the one we're interested in
*
* It is also possible to force this element to display values using the emitter events `digest.force.{class,icon,text,valid}`
*
* @param {string|Object} [url] The URL or AxiosRequest to fetch data (instead of specifying `collection` + `id`)
* @param {string} [field="title"] Field to display the title of, if using slots specify "*" to populate `data` with the raw data object
* @param {function|string} [filter] Optional function filter or named Vue filter to run the result through before outputting
* @param {string} [label] Use this label before fetching a remote one, if specifed the entity is treated as valid (including valid class and icon)
* @param {boolean} [lazy=true] If true, fetching will be defered until the element is actually shown within the content area
* @param {string} [lazyParents='#main, body'] jQuery compatible string listing the intersection parents to probe for when lazy==true, the first one found is assumed to be the parent
* @param {string} [lazyParentsDisable='.modal'] jQuery compatible string which, if matched disables lazy loading (defaults to inside modals by default)
* @param {string} [classValid] Apply this class to the element if the returned value is truthy
* @param {string} [classInvalid] Apply this class to the element if the return value is falsy
* @param {string|function} [textValid] Either overriding text to display if the element is valid, or a function to call with the server response which returns the mangled output
* @param {string|function} [textInvalid] As with `textValid` this is either overriding text or a function to mangle a server response
* @param {string} [iconValid] Optional icon to display next to the context when loaded
* @param {string} [iconInvalid] Optional icon to display next to the `textInvalid` text when an error occurs
* @param {boolean} [ignoreErrors=false] Ignore all thrown errors, if false they will be routed into this.$toast.catch
* @param {string} [hashMethod='urlField'] How to cache the digest result, see the $digest service for more info
*
* @listens digest.force.class Recieved as `(newClass)` to force a specific class on a digest component
* @listens digest.force.icon Recieved as `(newIconClass)` to force a specific icon class on a digest component
* @listens digest.force.text Recieved as `(newText)` to force a specific text value on the digest component
* @listens digest.force.valid Recieved as `(newIsValid)` to force validity checks on the digest component, this switches all classes, icons and text as needed
*
* @slot [loading] What to display when loading - defaults to a FA5 loading spinner. Bindings are `{config}`
* @slot [display] What to display when data is loaded. Bindings are `{config, data, displayContent}`
*
* @example Fetch a specific URL and extract a key
* <digest url="/api/some/url"/>
*
* @example Force all child digests to be invalid
* this.$emit.down('digest.force.valid', false)
*
* @example Pull in a full data record and template the responses
* <digest
*   field="*"
*   :url="`/api/widgets/${input.file}`"
* >
*   <template #loading>
*     <i class="far fa-spinner fa-spin"/>
*     Loading widget information...
*   </template>
*   <template #display="{data: widget}">
*     <strong class="d-block">{{widget.title}}</strong>
*     <small class="d-block">{{widget.description}}</small>
*   </template>
* </digest>
*/
app.component('digest', {
	data: ()=> ({
		data: undefined,
		displayContent: '',
		displayClass: undefined,
		isLazy: false,
		loading: true,
		useLabel: true, // Whether to display the $props.label content if its present, set to false on incomming events or overrides
	}),
	props: {
		url: {type: [Object, String], required: true},
		field: {type: String, default: "title"},
		filter: {type: [Function, String]},
		label: {type: String},
		lazy: {type: Boolean, default: true},
		lazyParents: {type: String, default: '#main, body'},
		lazyParentsDisable: {type: String, default: '.modal'},
		classValid: {type: String},
		classInvalid: {type: String},
		textValid: {type: [String, Function]},
		textInvalid: {type: [String, Function]},
		iconValid: {type: String},
		iconInvalid: {type: String},
		ignoreErrors: {type: Boolean, default: false},
		hashMethod: {type: String, defualt: 'urlField', validator: v => ['urlField', 'url', 'urlQuery'].includes(v)},
	},
	methods: {
		refresh() {
			this.loading = true;
			if (this.useLabel && this.$props.label) { // Use label instead of fetching remote?
				this.displayContent = this.$props.label;
				this.displayIcon = this.$props.iconValid;
				this.loading = false;
			} else { // Fetch remote data
				this.$digest.get(this.$props.url, this.$props.field, {hashMethod: this.$props.hashMethod})
					.then(value => {
						this.data = value;
						this.displayContent = typeof this.$props.textValid == 'string' ? this.$props.textValid
							: typeof this.$props.textValid == 'function' ? this.$props.textValid(value)
							: value;

						if (this.$props.filter) {
							if (_.isFunction(this.filter)) {
								this.displayContent = this.$props.filter(this.displayContent) // As func(v)
							} else if (_.isString(this.$props.filter)) {
								var filter = app.filter(this.filter)
								if (!filter) throw new Error(`Unknown filter "${this.filter}" specified in <digest filter/>`);
								this.displayContent = filter(this.displayContent); // As named filter
							} else {
								throw new Error(`Unknown filter type specified in <digest filter/>`)
							}
						}

						this.displayIcon = this.$props.iconValid;
						if (this.$props.classValid) this.displayClass = this.$props.classValid;
					})
					.catch(err => {
						this.displayContent = typeof this.$props.textInvalid == 'string' ? this.$props.textInvalid
							: typeof this.$props.textInvalid == 'function' ? this.$props.textInvalid(err)
							: err.statusText ? err.statusText
							: err;
						this.displayIcon = this.$props.iconInvalid;
						if (this.$props.classInvalid) this.displayClass = this.$props.classInvalid;
						if (!this.$props.ignoreErrors) this.$toast.catch(err);
					})
					.finally(()=> this.loading = false)
			}
		},
	},
	created() {
		this.$on('digest.force.class', c => this.displayClass = c);
		this.$on('digest.force.icon', i => this.displayIcon = i);
		this.$on('digest.force.text', t => {
			this.useLabel = false;
			this.displayContent = t;
		});
		this.$on('digest.force.valid', v => {
			if (v) {
				this.displayClass = this.$props.classValid;
				this.displayIcon = this.$props.iconValid;
				this.displayContent = this.$props.textValid;
			} else {
				this.displayClass = this.$props.classValid;
				this.displayIcon = this.$props.iconValid;
				this.displayContent = this.$props.textInvalid;
			}
		});
	},
	mounted() {
		// Check we can use Lazy observing
		if ($(this.$el).parents(this.$props.lazyParentsDisable).length) this.isLazy = false;

		// Bind an interesection observer to fire a callback when the element appears on screen {{{
		if (this.isLazy) {
			var intersectionObserver = new IntersectionObserver(data => {
				this.refresh();
				intersectionObserver.disconnect();
				intersectionObserver = null;
			}, {
				root: $(this.$el).closest(this.$props.lazyParents)[0],
				rootMargin: '100px',
				threshold: 0.1,
			});
			intersectionObserver.observe(this.$el);
		} else {
			this.refresh();
		}
		// }}}
	},
	watch: {
		url() { // Update when URL changes
			this.refresh();
		},
	},
});
</script>

<template>
	<div class="digest">
		<slot v-if="loading" name="loading" :config="$props">
			<i class="far fa-spinner fa-spin"/>
		</slot>
		<slot v-else name="display" :config="$props" :data="data" :displayContent="displayContent">
			<div :class="displayClass">
				<i v-if="displayIcon" :class="displayIcon"/>
				{{displayContent}}
			</div>
		</slot>
	</div>
</template>

<style>
.digest > span > i {
	margin-right: 2px;
}
</style>
