/**
 * Replaces items matched in the regex with spaces.
 *
 * @param {string} text The string being counted.
 *
 * @returns {string} The manipulated text.
 */
export default (text) => text.replace(/--|\u2014/g, ' ')