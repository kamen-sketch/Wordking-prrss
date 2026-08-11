/**
 * Strip double spaces from text
 *
 * @param {string} text The text to strip spaces from.
 *
 * @returns {string} The text without double spaces
 */
export default (text) => text
	.replace(/&nbsp;|&#160;/gi, ' ')
	.replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
	.replace(/\s\./g, '.') // Replace spaces followed by periods with only the period.
	.replace(/^\s+/g, '') // Remove first character if space
	.replace(/\s+$/g, '') // Remove last character if space