'use strict';
function loadXMLDoc(url, options = {}) {
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/xhtml+xml'
        }
    }).then(response => response.text());
}
async function displayResult() {
    const parser = new DOMParser();
    const srcpromises = [loadXMLDoc('xml/cdcatalog.xml'), loadXMLDoc('xml/cdcatalog.xsl')];
    const srcs = await Promise.all(srcpromises);
    const xmlobjproms = srcs.map(x => parseIntoXMLObject(parser, x));
    const xmlobjs = await Promise.all(xmlobjproms);
    const parsepromises = srcs;
    const { implementation } = document;
    if (implementation && implementation.createDocument) {
        const xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(xmlobjs[1]);
        const fragment = xsltProcessor.transformToFragment(xmlobjs[0], document);
        const element = document.getElementById('example');
        if (element != null)
            element.appendChild(fragment);
    }
}
function parseIntoXMLObject(parser, src) {
    const parse = () => parser.parseFromString(src, 'text/xml');
    const promise = new Promise(resolve => resolve(parse()));
    return promise;
}
document.addEventListener("load", displayResult());
