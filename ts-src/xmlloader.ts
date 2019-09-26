'use strict';
/** Loads an XML document, taking the URL to the document, and an object
 * containing options for `fetch`. */
function loadXMLDoc(url: RequestInfo, options: RequestInit = {}): Promise<string> {
	return fetch(url, {
		...options,
		headers: {
			'Content-Type': 'application/xhtml+xml'
		}
	}).then(response => response.text());
}

async function parseIntoXML(parser: DOMParser, src: string): Promise<Document> {
	return parser.parseFromString(src, 'application/xml');
}

const urls = ['/xml/cdcatalog.xml', '/xml/cdcatalog.xsl'];
const [xmlPromise, xslPromise] = urls.map(x => loadXMLDoc(x));

async function displayResult() {
	const xsltProcessor = new XSLTProcessor();
	const domParser = new DOMParser();

	const xsl = await xslPromise.then(xsl => parseIntoXML(domParser, xsl));
	xsltProcessor.importStylesheet(xsl);

	const fragment = await xmlPromise
		.then(xml => parseIntoXML(domParser, xml))
		.then(doc => xsltProcessor.transformToFragment(doc, document));
	document.body.appendChild(fragment);
}

document.addEventListener('DOMContentLoaded', displayResult);
