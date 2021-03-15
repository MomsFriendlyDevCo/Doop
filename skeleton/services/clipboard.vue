<script lang="js" frontend>
/**
* Various clipboard access functions
*/
app.service('$clipboard', {
	/**
	* Copy text to the clipboard in the supidest yet consistant way imagineable
	* NOTE: I can't believe hacks like these are still needed - MC 2020-09-02
	*
	* @param {string} text Text to copy
	* @returns {Promise} A promise that the text has copied, rejects with whatever the DOM had objections to
	*/
	copy: text => new Promise((resolve, reject) => {
		try { // Wrap the whole bloody thing in try/catch why not, what are we Java?!, only way to catch stupid DOM errors though
			var copyDiv = document.createElement('div');
			copyDiv.setAttribute('style', 'position: fixed; left: 50%; top: 50%'); // Kludge to not force the screen to scoll since we're appending to the end of the DOM
			copyDiv.contentEditable = true;
			document.body.appendChild(copyDiv);
			copyDiv.innerHTML = text.replace(/\n/g, '<br/>');
			copyDiv.unselectable = "off";
			copyDiv.focus();
			document.execCommand('SelectAll');
			document.execCommand('Copy', false, null);

			if (window.getSelection) {// Deselect everything as some browsers persist this
				if (window.getSelection().empty) {  // Chrome
					window.getSelection().empty();
				} else if (window.getSelection().removeAllRanges) {  // Firefox
					window.getSelection().removeAllRanges();
				}
			} else if (document.selection) {  // IE?
				document.selection.empty();
			}

			document.body.removeChild(copyDiv);
			resolve();
		} catch (e) {
			reject(e);
		}
	}),
});
</script>
