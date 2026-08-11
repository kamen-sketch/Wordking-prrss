/** @module stringProcessing/getAnchorsFromText */

/**
 * Check for anchors in the textstring and returns them in an array.
 *
 * @param {string} text The text to check for matches.
 * @returns {Array} The matched links in text.
 */
export default function (text) {
	let matches

	// Regex matches everything between <a> and </a>
	matches = text.match(/<a(?:[^>]+)?>(.*?)<\/a>/ig)

	if (null === matches) {
		matches = []
	}

	return matches
}