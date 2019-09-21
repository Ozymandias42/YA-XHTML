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
async function prepareNodeFromXML(xmlURL:RequestInfo, xslURL:RequestInfo): Promise<DocumentFragment>{
    const parser = new DOMParser();
    const xsltProcessor = new XSLTProcessor();

    async function parse(srcprom: Promise<string>): Promise<Document>{
        return srcprom.then(src => parser.parseFromString(src, 'text/xml'));
    }
    async function transform(xmlobjsprom: Promise<Document>[]): Promise<DocumentFragment>{
        const [xmlProm, xslProm] = xmlobjsprom;  
        await xslProm.then(xsl => xsltProcessor.importStylesheet(xsl));
        return xmlProm.then(xml => xsltProcessor.transformToFragment(xml, document));
    }

    //parallelised implementation
    const xmlobjsprom = [loadXMLDoc(xmlURL), loadXMLDoc(xslURL)].map(parse);
    const fragment = transform(xmlobjsprom);
    //const srcs        = await Promise.all(srcpromises);
    //const xmlobjproms = srcs.map(x => parseIntoXMLObject(parser, x));
    //const xmlobjs     = await Promise.all(xmlobjproms);
    //const fragment    = await applyXSLTtransform(xsltProcessor,xmlobjs);
    return fragment;
}
/** Displays the result, which means appending the XML to the document as a fragment. */
function displayResult() {

    const fragment = prepareNodeFromXML('xml/cdcatalog.xml', 'xml/cdcatalog.xsl');    
    const element = document.getElementById('example');
    if(element != null ) fragment.then(x => element.appendChild(x));
}

async function parseIntoXMLObject(parser: DOMParser, src: string): Promise<Document> {
    return parser.parseFromString(src, 'text/xml');
  }

async function applyXSLTtransform(xsltProcessor:XSLTProcessor,xmlobjs: Document[]): Promise<DocumentFragment>{
    xsltProcessor.importStylesheet(xmlobjs[1]);
    const fragment = xsltProcessor.transformToFragment(xmlobjs[0], document);
    return fragment;
}


document.addEventListener("load", displayResult());