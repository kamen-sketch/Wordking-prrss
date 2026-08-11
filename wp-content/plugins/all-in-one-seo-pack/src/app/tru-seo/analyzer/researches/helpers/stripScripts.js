/**
 * Removes <script> tags from text.
 *
 * @param {string} text The string to remove from.
 *
 * @returns {string} The manipulated text.
 */
export default (text) => text.replace(/<script[^>]*>.*?<\/script>/gi, '')