/**
* Shortcut provider and generic helper
* This is a global level collection of functions which can be shared by multiple directives
*/
angular
	.module('app')
	.provider('shortcut', function() {
		var shortcut = this;

		// Key codes {{{
		shortcut.codeToKey = {
			// General keys
			3: ['cancel'],
			8: ['backspace'],
			9: ['tab'],
			12: ['clear'],
			13: ['enter'],
			16: ['shift'],
			17: ['ctrl'],
			18: ['alt', 'menu'],
			19: ['pause', 'break'],
			20: ['capslock'],
			27: ['escape', 'esc'],
			32: ['space', 'spacebar'],
			33: ['pageup'],
			34: ['pagedown'],
			35: ['end'],
			36: ['home'],
			37: ['left'],
			38: ['up'],
			39: ['right'],
			40: ['down'],
			41: ['select'],
			42: ['printscreen'],
			43: ['execute'],
			44: ['snapshot'],
			45: ['insert', 'ins'],
			46: ['delete', 'del'],
			47: ['help'],
			145: ['scrolllock', 'scroll'],
			187: ['equal', 'equalsign', '='],
			188: ['comma', ','],
			190: ['period', '.'],
			191: ['slash', 'forwardslash', '/'],
			192: ['graveaccent', '`'],
			219: ['openbracket', '['],
			220: ['backslash', '\\'],
			221: ['closebracket', ']'],
			222: ['apostrophe', '\''],

			// 0-9
			48: ['zero', '0'],
			49: ['one', '1'],
			50: ['two', '2'],
			51: ['three', '3'],
			52: ['four', '4'],
			53: ['five', '5'],
			54: ['six', '6'],
			55: ['seven', '7'],
			56: ['eight', '8'],
			57: ['nine', '9'],

			// numpad
			96: ['numzero', 'num0'],
			97: ['numone', 'num1'],
			98: ['numtwo', 'num2'],
			99: ['numthree', 'num3'],
			100: ['numfour', 'num4'],
			101: ['numfive', 'num5'],
			102: ['numsix', 'num6'],
			103: ['numseven', 'num7'],
			104: ['numeight', 'num8'],
			105: ['numnine', 'num9'],
			106: ['nummultiply', 'num*'],
			107: ['numadd', 'num+'],
			108: ['numenter'],
			109: ['numsubtract', 'num-'],
			110: ['numdecimal', 'num.'],
			111: ['numdivide', 'num/'],
			144: ['numlock', 'num'],

			// function keys
			112: ['f1'],
			113: ['f2'],
			114: ['f3'],
			115: ['f4'],
			116: ['f5'],
			117: ['f6'],
			118: ['f7'],
			119: ['f8'],
			120: ['f9'],
			121: ['f10'],
			122: ['f11'],
			123: ['f12'],
		};

		// a-z iterator
		_.range(97, 122).forEach(code => { // a - z in ASCII
			var keyName = String.fromCharCode(code + 32);
			shortcut.codeToKey[code] = [ String.fromCharCode(code) ];
		});


		shortcut.keyToCode = {};
		Object.keys(shortcut.codeToKey).forEach(code => {
			shortcut.codeToKey[code].forEach(key => shortcut.keyToCode[key] = code);
		});
		// }}}

		// Buckey Keys {{{
		shortcut.buckyCodeToKey = {
			0: ['ctrl', 'control'],
			1: ['shift'],
			2: ['meta', 'alt'],
		};

		shortcut.buckyKeyToCode = {};
		Object.keys(shortcut.buckyCodeToKey).forEach(code => {
			shortcut.buckyCodeToKey[code].forEach(key => shortcut.buckyKeyToCode[key] = code);
		});
		// }}}


		/**
		* Translate a human readable string into a key mask
		* NOTE: This currently throws on multiple keys (e.g. 'a+b')
		* NOTE: "ALL" captures all keys
		* @param {string} str The string to translate
		* @returns {Object} An object contianing a key + bucky
		*
		* @example Get the keymask for the letter 's'
		* shortcut.getKeyMask('s') //= {keyCode: 115}
		* @example Get the keymask for Ctrl + S
		* shortcut.getKeyMask('ctrl + s') //= {keyCode: 115, ctrlKey: true}
		*/
		shortcut.getKeyMask = str => {
			var keyMask = {
				string: str,
				keyCode: undefined,
				ctrlKey: false,
				shiftKey: false,
				metaKey: false,
			};

			str
				.toLowerCase()
				.split(/[\+\s]+/)
				.forEach(bit => {
					if (shortcut.buckyKeyToCode[bit]) { // Is a bucky key
						keyMask[shortcut.buckyCodeToKey[shortcut.buckyKeyToCode[bit]][0] + 'Key'] = true;
					} else if (shortcut.keyToCode[bit]) { // Is a regular key
						if (keyMask.keyCode) throw new Error(`Keycode is already bound. Cannot bind multiple base keys in "${str}"`);
						keyMask.keyCode = shortcut.keyToCode[bit];
					} else if (bit == 'all') {
						keyMask.keyCode = 'ALL';
					} else { // Unknown key
						throw new Error(`Unknown key: "${bit}"`);
					}
				});

			console.log('KEYMASK', str, keyMask);

			return keyMask;
		};


		// Angular nonsense function to get this instance
		shortcut.$get = function() { return shortcut };
	})
