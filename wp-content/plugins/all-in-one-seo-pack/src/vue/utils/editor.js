/**
 * Returns the block editor iframe element if it exists.
 *
 * @since 4.9.6
 *
 * @returns {HTMLIFrameElement|null} The editor iframe element.
 */
export const getEditorIframe = () => {
	return document.querySelector('iframe[name="editor-canvas"]')
}

/**
 * Detects if the block editor is rendered inside an iframe (WordPress 7.0+).
 *
 * @since 4.9.6
 *
 * @returns {boolean} Whether the editor is in iframe mode.
 */
export const isIframedEditor = () => {
	const hasIframedClass = !!document.querySelector('.editor-visual-editor.is-iframed')
	const hasEditorIframe = !!getEditorIframe()

	return hasIframedClass && hasEditorIframe
}

/**
 * Returns the document context for the block editor content.
 * In iframe mode, returns the iframe's contentDocument; otherwise, the main document.
 *
 * @since 4.9.6
 *
 * @returns {Document} The editor document.
 */
export const getEditorDocument = () => {
	if (isIframedEditor()) {
		return getEditorIframe()?.contentDocument || document
	}

	return document
}

/**
 * Returns the window context for the block editor content.
 * In iframe mode, returns the iframe's contentWindow; otherwise, the main window.
 *
 * @since 4.9.6
 *
 * @returns {Window} The editor window.
 */
export const getEditorWindow = () => {
	if (isIframedEditor()) {
		return getEditorIframe()?.contentWindow || window
	}

	return window
}