/** @module stringProcessing/getAlttagContent */

import stripSpaces from '../stringProcessing/stripSpaces.js'

const regexAltTag = /alt=(['"])(.*?)\1/i

/**
 * Checks for an alttag in the image and returns its content
 *
 * @param {string} text Textstring to match alt
 * @returns {string} the contents of the alttag, empty if none is set.
 */
export default function (text) {
	let alt = ''
	const matches = text.match(regexAltTag)

	if (null !== matches) {
		alt = stripSpaces(matches[2])

		alt = alt.replace(/&quot;/g, '"')
		alt = alt.replace(/&#039;/g, '\'')
	}
	return alt
}