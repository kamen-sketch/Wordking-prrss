/**
 * Normalizes quotes to 'regular' quotes.
 *
 * @param {string} text Text to normalize.
 *
 * @returns {string} The normalized text.
 */
export default (text) => text.replace(/[‘’‛`]/g, '\'').replace(/[“”〝〞〟‟„]/g, '"')