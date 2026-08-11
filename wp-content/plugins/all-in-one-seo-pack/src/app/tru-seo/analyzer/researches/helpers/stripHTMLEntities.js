/**
 * Removes items matched in the regex.
 *
 * @param {string} text The string being counted.
 *
 * @returns {string} The manipulated text.
 */
export default (text) => text.replace(/&\S+?;/g, '')