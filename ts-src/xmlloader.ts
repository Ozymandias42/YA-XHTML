'use strict'
/** Loads an XML document, taking the URL to the document, and an object
 * containing options for `fetch`. */
function loadXMLDoc (url: RequestInfo, options: RequestInit = {}): Promise<string> {
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/xhtml+xml'
        }
    }).then(response => response.text());
}

/** Displays the result, which means appending the XML to the document as a fragment. */
async function displayResult () {
    const parser = new DOMParser();

    //Problem with the following await-lines. each line blocks until finished 
    //before the next one even starts (to block)
    //better solution would get both xml and xsl asynchronously 
    //and start parsing them asynchronously as soon as they are available 
    //const xmlsrc = await loadXMLDoc('xml/cdcatalog.xml');
    //const xml    = await parseIntoXMLObject(parser, xmlsrc);

    //const xslsrc = await loadXMLDoc('xml/cdcatalog.xsl');
    //const xsl    = await parseIntoXMLObject(parser, xslsrc);

    //parallelised implementation
    const srcpromises = [loadXMLDoc('xml/cdcatalog.xml'), loadXMLDoc('xml/cdcatalog.xsl')];
    const srcs = await Promise.all(srcpromises);
    const xmlobjproms = srcs.map(x => parseIntoXMLObject(parser, x));
    const xmlobjs = await Promise.all(xmlobjproms);

    const parsepromises = srcs

    //const xml : XMLDocument = await loadXMLDoc('xml/cdcatalog.xml');
    //const xsl : XMLDocument = await loadXMLDoc('xml/cdcatalog.xsl');
    const { implementation } = document;

    if (implementation && implementation.createDocument) {
        const xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(xmlobjs[1]);
        
        const fragment = xsltProcessor.transformToFragment(xmlobjs[0], document);
        const element = document.getElementById('example');
        if(element != null ) element.appendChild(fragment);
    }
}

function parseIntoXMLObject(parser: DOMParser, src: string): Promise<Document> {
    const parse = () => parser.parseFromString(src, 'text/xml');
    const promise: Promise<Document> = new Promise(resolve => resolve(parse()));
  return promise;
}


document.addEventListener("load", displayResult());