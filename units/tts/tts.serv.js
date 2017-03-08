/**
* Text-to-speach Voice Synth
*
* @example
* $tts.say('Hello World')
*/

angular
	.module('app')
	.service('$tts', function($window) {
		var $tts = this;


		/**
		* Whether this platform actually supports TTS
		* @var {boolean}
		*/
		$tts.hasTTS = false;


		/**
		* Array of voices supported by this platform
		* @var {array}
		*/
		$tts.voices;


		/**
		* The currently selected voice
		* This is auto determined when voices are loaded
		* @var {Object}
		*/
		$tts.voice;


		/**
		* The originally recommended voice (determined via voicePreference rules)
		* @var {Object}
		*/
		$tts.recommendedVoice;


		/**
		* Preferences on how to determine the voice to use
		* This should be an array of lodash match criteria, the first matched item wins
		* @var {array}
		*/
		$tts.voicePreference = [
			{isDefault: true},
			{lang: 'en-US'},
			i => i.lang == 'en-US' && / female$/i.test(i.name),
			i => i.lang == 'en-GB' && / female/i.test(i.name),
			i => i.lang == 'en-US' && / male$/i.test(i.name),
			i => i.lang == 'en-GB' && / male$/i.test(i.name),
			{lang: 'en-GB'},
			i => /english united states$/i.test(i.name),
			i => /english united kingdom$/i.test(i.name),
			i => /united states$/i.test(i.name),
			i => /english/i.test(i.name),
		];


		/**
		* Say a phrase with the selected voice
		* @param {string} text The text to say
		* @return {$tts} This chainable object
		*/
		$tts.say = function(text) {
			if (!$tts.hasTTS) return;
			var phrase = new SpeechSynthesisUtterance(text);
			phrase.voice = $tts.voice;
			$window.speechSynthesis.speak(phrase);
			return $tts;
		};


		/**
		* Refresh the available voices
		* This function is automatically called during init()
		* @return {$tts} This chainable object
		* @see init()
		*/
		$tts.refreshVoices = function() {
			if ('speechSynthesis' in window) {
				$tts.hasTTS = true;
				$tts.voices = $window.speechSynthesis.getVoices();

				// Try to allocate a default based on $tts.voicePreference
				$tts.voicePreference.find(preference => {
					var candidate = _.find($tts.voices, preference)
					if (candidate) $tts.voice = $tts.recommendedVoice = candidate;
					return candidate;
				});
				if (!$tts.voice) $tts.voice = $tts.voices[0]; // Use first one we see
			}
			return $tts;
		};


		/**
		* Init everything
		* This will try to call refreshVoices() as soon as possible, depending on the platform
		* @return {$tts} This chainable object
		* @see refreshVoices()
		*/
		$tts.init = function() {
			// If getVoices() already provides us with an array - use that (FireFox)
			if ($window.speechSynthesis && $window.speechSynthesis.getVoices && $window.speechSynthesis.getVoices().length) {
				$tts.refreshVoices();
			} else {
				// Otherwise wait for the browser to load all the TTS voices (every other browser)
				$window.speechSynthesis.onvoiceschanged = ()=> $tts.refreshVoices();
			}
			// }}}
		};

		$tts.init();
	});
