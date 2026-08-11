/**
 * External dependencies
 */
import urlMethods from 'url'
import { includes } from 'lodash-es'

const urlFromAnchorRegex = /href=(["'])([^"']+)\1/i

/**
 * Determines whether the link is a relative fragment URL.
 *
 * @param {string} url Link to check.
 *
 * @returns {boolean} Whether link is relative or not.
 */
function isRelativeFragmentURL (url) {
	return '#' === url[0]
}

/**
 * Returns the protocol of a URL.
 *
 * @param {string} url Link to extract from.
 *
 * @returns {string} Protocol.
 */
function getProtocol (url) {
	return urlMethods.parse(url).protocol // eslint-disable-line
}

/**
 * Retrieves the URL from an anchor tag.
 *
 * @param {string} anchorTag Anchor tag string.
 *
 * @returns {string} Url.
 */
function getFromAnchorTag (anchorTag) {
	const urlMatch = urlFromAnchorRegex.exec(anchorTag)

	return (null === urlMatch) ? '' : urlMatch[2]
}

/**
 * Checks whether the protocol is either HTTP: or HTTPS:.
 *
 * @param {string} protocol Protol string to validate.
 *
 * @returns {boolean} Has valid protocol or not.
 */
function isHttpScheme (protocol) {
	if (!protocol) {
		return true
	}

	return ('http:' === protocol || 'https:' === protocol)
}

/**
 * Determine whether a URL is internal.
 *
 * @param {string} url  Url to check.
 * @param {string} host Site url.
 *
 * @returns {boolean} Whether internal or not.
 */
function isInternalLink (url, host) {
	// Check if the URL starts with a single slash.
	if (!includes(url, '//') && '/' === url[0]) {
		return true
	}

	// Check if the URL starts with a # indicating a fragment.
	if (isRelativeFragmentURL(url)) {
		return false
	}

	const parsedUrl = urlMethods.parse(url, false, true) // eslint-disable-line

	// No host indicates an internal link.
	if (!parsedUrl.host) {
		return true
	}

	return parsedUrl.host === host
}

/**
 * Determines the type of link.
 *
 * @param {string} text Text to get links from.
 * @param {string} url  Base link.
 *
 * @returns {string} Link type.
 */
export function getLinkType (text, url) {
	const anchorUrl = getFromAnchorTag(text)

	/**
	 * A link is "Other" if:
	 * - The protocol is neither null, nor http, nor https.
	 * - The link is a relative fragment URL (starts with #), because it won't navigate to another page.
	 */
	if (!isHttpScheme(getProtocol(anchorUrl)) || isRelativeFragmentURL(anchorUrl)) {
		return 'other'
	}

	if (isInternalLink(anchorUrl, url)) {
		return 'internal'
	}

	return 'external'
}

/**
 * Checks if a link has a `rel` attribute with a `nofollow` value. If it has, returns Nofollow, otherwise Dofollow.
 *
 * @param {string} anchorHTML Anchor tag html.
 * @param {string} linkType   Link type
 *
 * @returns {string} Nofollow or Dofollow.
 */
export function checkNofollow (anchorHTML) {
	anchorHTML = anchorHTML.toLowerCase()

	if (!includes(anchorHTML, '<a') || !includes(anchorHTML, 'rel=')) {
		return 'Dofollow'
	}

	return includes(anchorHTML, 'nofollow') ? 'Nofollow' : 'Dofollow'
}

/**
 * Get anchor tags from text.
 *
 * @param {string} text Text to parse for anchor tags.
 *
 * @returns {Array} Found anchor tags.
 */
export function getLinks (text) {
	return text.match(/<a(?:[^>]+)?>/gi)
}