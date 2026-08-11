/** @module stringProcessing/addWordboundary */
/* eslint-disable no-useless-escape */

import { escapeRegExp } from 'lodash-es'

const selfWindow = 'undefined' !== typeof window
	? window
	: (
		'undefined' !== typeof self
			? self
			: {}
	)

/**
 * Returns a string that can be used in a regex to match a matchString with word boundaries.
 *
 * @param {string}  matchString                 The string to generate a regex string for.
 * @param {boolean} [positiveLookAhead=false]   Boolean indicating whether or not to include a positive look ahead
 * for the word boundaries at the end.
 * @param {string} [extraWordBoundary=""]       Extra characters to match a word boundary on.
 * @param {string} [locale=""]                  The locale used to determine the word boundary.
 *
 * @returns {string} A regex string that matches the matchString with word boundaries.
 */
export default function (matchString, positiveLookAhead = false, extraWordBoundary = '', locale = '') {
	let wordBoundary, wordBoundaryEnd

	const symbols = [
		'\u00AE', // Registered sign
		'\u2122', // Trademark sign
		'\u2120', // Service mark
		'\u00A9', // Copyright sign
		'\u2117'  // Sound recording copyright
	].join('')

	// \u200B - zero width space
	// \u00a0 - no-break space
	// \u06d4 - Urdu full stop
	// \u061f - Arabic question mark
	// \u060C - Arabic comma
	// \u061B - Arabic semicolon
	wordBoundary = ` \\u200B\\u00a0\\u06d4\\u061f\\u060C\\u061B\\n\\r\\t\.,\(\)”“〝〞〟‟„"+\\-;!¡?¿:\/»«‹›${symbols}${extraWordBoundary}<>`

	if ('id_ID' === locale) {
		wordBoundary = ` \\u200B\\u00a0\\n\\r\\t\.,\(\)”“〝〞〟‟„"+;!¡?¿:\/»«‹›${symbols}${extraWordBoundary}<>`
	}

	// Add the Search Appearance Separator to the boundary list.
	if (selfWindow && selfWindow.aioseoAnalyzer) {
		selfWindow.aioseoAnalyzer.separator.split('').forEach(character => {
			wordBoundary += `\\${character}`
		})
	}

	const wordBoundaryStart = `(^|[${wordBoundary}'‘’‛\`])`
	if (positiveLookAhead) {
		wordBoundaryEnd = `($|((?=[${wordBoundary}]))|((['‘’‛\`])([${wordBoundary}])))`
	} else {
		wordBoundaryEnd = `($|([${wordBoundary}])|((['‘’‛\`])([${wordBoundary}])))`
	}

	return wordBoundaryStart + escapeRegExp(matchString) + wordBoundaryEnd
}