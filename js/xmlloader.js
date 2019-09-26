'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function loadXMLDoc(url, options = {}) {
    return fetch(url, Object.assign({}, options, { headers: {
            'Content-Type': 'application/xhtml+xml'
        } })).then(response => response.text());
}
function parseIntoXML(parser, src) {
    return __awaiter(this, void 0, void 0, function* () {
        return parser.parseFromString(src, 'application/xml');
    });
}
const urls = ['/xml/cdcatalog.xml', '/xml/cdcatalog.xsl'];
const [xmlPromise, xslPromise] = urls.map(x => loadXMLDoc(x));
function displayResult() {
    return __awaiter(this, void 0, void 0, function* () {
        const xsltProcessor = new XSLTProcessor();
        const domParser = new DOMParser();
        const xsl = yield xslPromise.then(xsl => parseIntoXML(domParser, xsl));
        xsltProcessor.importStylesheet(xsl);
        const fragment = yield xmlPromise
            .then(xml => parseIntoXML(domParser, xml))
            .then(doc => xsltProcessor.transformToFragment(doc, document));
        document.body.appendChild(fragment);
    });
}
document.addEventListener('DOMContentLoaded', displayResult);
