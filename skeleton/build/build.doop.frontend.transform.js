/**
* DoopFrontend, SFC parcel asset transform
*/
var _ = require('lodash');
var VueAsset = require('parcel-bundler/src/assets/VueAsset');

class DoopFrontendAsset extends VueAsset {
	constructor(name, options) {
		super(name, options);
		this.type = 'js';
	}

	async parse(code) {
		if ((code.match(/^<script.*>/gm) || []).length > 1) throw new Error(`Multiple <script lang="js"/> tags exist in ${this.relativeName} - only one tag allowed per SFC spec https://vue-loader.vuejs.org/spec.html#script`);
		var parsed = await super.parse(code);
		return parsed;
	}

	async generate() {
		if (!this.ast) return []; // Reject empty AST trees

		if (this?.ast?.script?.content) { // We have a script payload
			// Splice 'export default' in front of the first non-exported component within the file if the user isn't handling exports manually
			if (!/export default/.test(this.ast.script.content)) {
				this.ast.script.content = this.ast.script.content
					.replace(/^(\s*)(app\.component\()/m, '$1export default $2');
					// TODO: Would seem MG components are not being passed in here.
					//.replace(/^(\s*)(app\.(mgC|c){1}omponent\()/m, '$1export default $2');
			}

			// Apply inline `@IMPORT` replacements for only /services/config/config.vue
			if (this.id == 'services/config/config.vue')
				this.ast.script.content = this.ast.script.content
					.replace(/0\/\* @IMPORT: (.+?) \*\//g, (junk, i) => JSON.stringify(_.get({app}, i)))
		}

		return await super.generate();
	}

	async postProcess(generated) {
		if (!this.ast) return []; // Reject empty AST trees
		return await super.postProcess(generated);
	}
}

module.exports = DoopFrontendAsset;
// }}}
