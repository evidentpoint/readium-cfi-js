import $ from 'jquery';
import { Generator } from '../../src/index';
import { NodeTypeError, OutOfRangeError } from '../../src/errors';

import fixtureMobyDickContentDoc from '../fixtures/moby_dick_content_doc.xhtml';
import fixtureMobyDickPackage from '../fixtures/moby_dick_package.opf';

describe('CFI GENERATOR', () => {
  describe('range generation', () => {
    it('can generate a range component that ends at an arbitrary element ancestor', () => {
      // prettier-ignore
      const dom =
                "<html>"
                +    "<div></div>"
                +    "<div>"
                +         "<div id='startParent'>"
                +             "<div></div>"
                +             "textnode1"
                +             "<div></div>"
                +             "textNode2"
                +             "<div></div>"
                +         "</div>"
                +     "</div>"
                +     "<div></div>"
                + "</html>";
      const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

      const commonAncestor = $($dom.children()[0]).children()[1];
      const $startElement = $($('#startParent', $dom).contents()[0]);
      const generatedCFI = Generator.createCFIElementSteps($startElement, commonAncestor);
      expect(generatedCFI).toEqual('/2[startParent]/2');
    });

    it('can generate a range component targeting a single element as a range', () => {
      // prettier-ignore
      const dom =
                "<html>"
                +    "<div></div>"
                +    "<div>"
                +         "<div id='commonAncestor'>"
                +             "textnode1"
                +             "<div id='targetElement'></div>"
                +             "textNode2"
                +         "</div>"
                +     "</div>"
                +     "<div></div>"
                + "</html>";
      const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

      const $commonAncestor = $('#commonAncestor', $dom);
      const generatedCFI = Generator.generateRangeComponent(
        $commonAncestor[0],
        1,
        $commonAncestor[0],
        2,
      );
      expect(generatedCFI).toEqual('/4/2[commonAncestor]/2[targetElement]');
    });

    it('can generate a range component between a text node and an element node', () => {
      // prettier-ignore
      const dom =
                "<html>"
                +    "<div></div>"
                +    "<div>"
                +         "<div id='startParent'>"
                +             "textnode"
                +             "<div></div>"
                +             "textnode1"
                +             "<div></div>"
                +         "</div>"
                +     "</div>"
                +     "<div></div>"
                + "</html>";
      const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

      const $startElement1 = $($('#startParent', $dom).contents()[0]);
      const $startElement2 = $($('#startParent', $dom).contents()[1]);
      const generatedCFI = Generator.generateRangeComponent(
        $startElement1[0],
        1,
        $startElement2[0],
        0,
      );
      expect(generatedCFI).toEqual('/4/2[startParent],/1:1,/2');
    });

    it('can generate a range component between an element node and a text node', () => {
      // prettier-ignore
      const dom =
                "<html>"
                +    "<div></div>"
                +    "<div>"
                +         "<div id='startParent'>"
                +             "textnode"
                +             "<div></div>"
                +             "textnode1"
                +             "<div></div>"
                +         "</div>"
                +     "</div>"
                +     "<div></div>"
                + "</html>";
      const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

      const $startElement1 = $($('#startParent', $dom).contents()[1]);
      const $startElement2 = $($('#startParent', $dom).contents()[2]);
      const generatedCFI = Generator.generateRangeComponent(
        $startElement1[0],
        0,
        $startElement2[0],
        1,
      );
      expect(generatedCFI).toEqual('/4/2[startParent],/2,/3:1');
    });

    it('can generate a range component between a text node in an element node and a text node with the same parent', () => {
      // prettier-ignore
      const dom =
            "<html>"
              +    "<div></div>"
              +    "<div>"
              +         "<div id='startParent'>"
              +             "textnode0"
              +             "<div id='startElement'>textnode1</div>"
              +             "textnode2"
              +             "<div></div>"
              +         "</div>"
              +     "</div>"
              +     "<div></div>"
              + "</html>";
      const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

      const $startElement1 = $($('#startElement', $dom).contents()[0]);
      const $startElement2 = $($('#startParent', $dom).contents()[2]);
      const generatedCFI = Generator.generateRangeComponent(
        $startElement1[0],
        4,
        $startElement2[0],
        4,
      );
      expect(generatedCFI).toEqual('/4/2[startParent],/2[startElement]/1:4,/3:4');
    });

    it('can generate a range component between an element node and a text node with different parents', () => {
      // prettier-ignore
      const dom =
                "<html>"
                +    "<div></div>"
                +    "<div>"
                +         "<div id='startParent'>"
                +             "textnode"
                +             "<div></div>"
                +             "textnode1"
                +             "<div></div>"
                +         "</div>"
                +     "</div>"
                +     "<div id='end'></div>"
                + "</html>";
      const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

      const $startElement1 = $($('#startParent', $dom).contents()[0]);
      const $startElement2 = $($('#end', $dom)[0]);
      const generatedCFI = Generator.generateRangeComponent(
        $startElement1[0],
        1,
        $startElement2[0],
        0,
      );
      expect(generatedCFI).toEqual('/2,/4/2[startParent]/1:1,/6[end]');
    });

    it('can generate an element range CFI for a node with a period in the ID', () => {
      // prettier-ignore
      const dom =
                "<html>"
                +    "<div></div>"
                +    "<div>"
                +         "<div id='startParent'>"
                +             "<div id=\"period-.-in.id\"></div>"
                +             "textnode1"
                +             "<div></div>"
                +             "textNode2"
                +             "<div></div>"
                +         "</div>"
                +     "</div>"
                +     "<div></div>"
                + "</html>";
      const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

      const $startElement1 = $($('#startParent', $dom).children()[0]);
      const $startElement2 = $($('#startParent', $dom).children()[2]);
      const generatedCFI = Generator.generateElementRangeComponent(
        $startElement1[0],
        $startElement2[0],
      );

      expect(generatedCFI).toEqual('/4/2[startParent],/2[period-.-in.id],/6');
    });

    it('can generate an element range CFI for different start nodes', () => {
      // prettier-ignore
      const dom =
                "<html>"
                +    "<div></div>"
                +    "<div>"
                +         "<div id='startParent'>"
                +             "<div></div>"
                +             "textnode1"
                +             "<div></div>"
                +             "textNode2"
                +             "<div></div>"
                +         "</div>"
                +     "</div>"
                +     "<div></div>"
                + "</html>";
      const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

      const $startElement1 = $($('#startParent', $dom).children()[0]);
      const $startElement2 = $($('#startParent', $dom).children()[2]);
      const generatedCFI = Generator.generateElementRangeComponent(
        $startElement1[0],
        $startElement2[0],
      );

      expect(generatedCFI).toEqual('/4/2[startParent],/2,/6');
    });

    it('can generate an element range CFI if the start and end node is the same', () => {
      // prettier-ignore
      const dom =
                "<html>"
                +    "<div></div>"
                +    "<div>"
                +         "<div id='startParent'>"
                +             "<div></div>"
                +             "textnode1"
                +             "<div></div>"
                +             "textNode2"
                +             "<div></div>"
                +         "</div>"
                +     "</div>"
                +     "<div></div>"
                + "</html>";
      const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

      const $startElement1 = $($('#startParent', $dom).children()[0]);
      const $startElement2 = $($('#startParent', $dom).children()[0]);

      const generatedCFI = Generator.generateElementRangeComponent(
        $startElement1[0],
        $startElement2[0],
      );
      expect(generatedCFI).toEqual('/4/2[startParent]/2');
    });

    it('can generate a range component given a start text node as a text node, and the end node being the parent of that text node', () => {
      // prettier-ignore
      const dom =
                "<html>"
                +    "<div></div>"
                +    "<div>"
                +         "<div id='startParent'>"
                +             "textnode0"
                +             "<p id='theParagraph'>textnode1</p>"
                +             "textnode2"
                +             "<div></div>"
                +         "</div>"
                +     "</div>"
                +     "<div></div>"
                + "</html>";
      const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

      const paragraphElement = $('#theParagraph', $dom)[0];
      const paragraphTextNode = paragraphElement.childNodes[0];

      // The setup here is a range that fits this profile
      // - commonAncestorContainer: p#theParagraph
      // - startContainer: 'textnode1', child of p#theParagraph
      // - startOffset: 0 (start character offset)
      // - endContainer: p#theParagraph
      // - endOffset: 1 (length of p#theParagraph node)
      // A browser may generate a Range that matches this when a paragraph is fully selected. (seen in MS Edge)

      const generatedCFI = Generator.generateRangeComponent(
        paragraphTextNode,
        0,
        paragraphElement,
        1,
      );
      expect(generatedCFI).toEqual('/4/2[startParent]/2[theParagraph],/1:0,/1:9');
    });

    it("can generate a range component given a start node that's parent of a text node, and the end node being that text node", () => {
      // prettier-ignore
      const dom =
                "<html>"
                +    "<div></div>"
                +    "<div>"
                +         "<div id='startParent'>"
                +             "textnode0"
                +             "<p id='theParagraph'>textnode1</p>"
                +             "textnode2"
                +             "<div></div>"
                +         "</div>"
                +     "</div>"
                +     "<div></div>"
                + "</html>";
      const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

      const paragraphElement = $('#theParagraph', $dom)[0];
      const paragraphTextNode = paragraphElement.childNodes[0];

      // The setup here is a range that fits this profile
      // - commonAncestorContainer: p#theParagraph
      // - startContainer: p#theParagraph
      // - startOffset: 0 (start offset of p#theParagraph node length)
      // - endContainer: 'textnode1', child of `p#theParagraph
      // - endtOffset: 9 (length of text node data)
      // A browser may also theoretically generate a Range like this when a paragraph is fully selected.

      const generatedCFI = Generator.generateRangeComponent(
        paragraphElement,
        0,
        paragraphTextNode,
        paragraphTextNode.length,
      );
      expect(generatedCFI).toEqual('/4/2[startParent]/2[theParagraph],/1:0,/1:9');
    });

    describe('character offset range CFIs', () => {
      it('generates for different start and end nodes', () => {
        // prettier-ignore
        const dom =
                    "<html>"
                    +    "<div></div>"
                    +    "<div>"
                    +         "<div id='startParent'>"
                    +             "<div>text target for start</div>"
                    +             "textnode1"
                    +             "<div></div>"
                    +             "textNode2"
                    +             "<div>text target for end</div>"
                    +         "</div>"
                    +     "</div>"
                    +     "<div></div>"
                    + "</html>";
        const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

        const $startElement = $($('#startParent', $dom).children()[0].firstChild);
        const $endElement = $($('#startParent', $dom).children()[2].firstChild);
        const generatedCFI = Generator.generateCharOffsetRangeComponent(
          $startElement[0],
          6,
          $endElement[0],
          2,
        );

        expect(generatedCFI).toEqual('/4/2[startParent],/2/1:6,/6/1:2');
      });

      it('generates for the same start and end node, with differet offsets', () => {
        // prettier-ignore
        const dom =
                    "<html>"
                    +    "<div></div>"
                    +    "<div>"
                    +         "<div id='startParent'>"
                    +             "<div>text target for start</div>"
                    +             "textnode1"
                    +             "<div></div>"
                    +             "textNode2"
                    +             "<div>text target for end</div>"
                    +         "</div>"
                    +     "</div>"
                    +     "<div></div>"
                    + "</html>";
        const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

        const $startElement = $($('#startParent', $dom).children()[0].firstChild);
        const $endElement = $($('#startParent', $dom).children()[0].firstChild);
        const generatedCFI = Generator.generateCharOffsetRangeComponent(
          $startElement[0],
          2,
          $endElement[0],
          6,
        );

        expect(generatedCFI).toEqual('/4/2[startParent]/2,/1:2,/1:6');
      });

      // https://github.com/readium/readium-cfi-js/issues/28
      it('generates for different node level', () => {
        // prettier-ignore
        const dom =
                    "<html>"
                    +    "<div></div>"
                    +    "<div>"
                    +         "<div id='startParent'>"
                    +             "text target for start"
                    +             "<div>text target for end</div>"
                    +         "</div>"
                    +     "</div>"
                    +     "<div></div>"
                    + "</html>";
        const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

        const $startElement = $($('#startParent', $dom).contents()[0]);
        const $endElement = $($('#startParent', $dom).children()[0].firstChild);
        const generatedCFI = Generator.generateCharOffsetRangeComponent(
          $startElement[0],
          2,
          $endElement[0],
          6,
        );

        expect(generatedCFI).toEqual('/4/2[startParent],/1:2,/2/1:6');
      });

      // https://github.com/readium/readium-cfi-js/issues/28
      it('generates for different node level II', () => {
        // prettier-ignore
        const dom =
                    "  <html>"  +
                    "    <body>" +
                    "        <h1>Title</h1>" +
                    "        <p>Some <strong>very important</strong> text</p>" +
                    "    </body>" +
                    "</html>";

        const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));
        // per the issue The CFI for "important text" should be : /2/4, /2/1:5, /3:5
        const $startElement = $($('strong', $dom).contents()[0]); // "very important"
        const $endElement = $($('p', $dom).contents()[2]); // " text"
        const generatedCFI = Generator.generateCharOffsetRangeComponent(
          $startElement[0],
          5,
          $endElement[0],
          5,
        );

        expect(generatedCFI).toEqual('/2/4,/2/1:5,/3:5');
      });

      it('generates for an element with multiple child text nodes', () => {
        // prettier-ignore
        const dom =
                    "<html>"
                    +    "<div></div>"
                    +    "<div>"
                    +         "<div id='startParent'>"
                    +             "<div>content</div>"
                    +             "textnode1"
                    +             "<div></div>"
                    +             "textNode2"
                    +             "<div>content</div>"
                    +             "textNode3"
                    +             "textNode4"
                    +         "</div>"
                    +     "</div>"
                    +     "<div></div>"
                    + "</html>";
        const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

        const $startElement = $($('#startParent', $dom).contents()[1]);
        const $endElement = $($('#startParent', $dom).contents()[5]);
        const generatedCFI = Generator.generateCharOffsetRangeComponent(
          $startElement[0],
          2,
          $endElement[0],
          6,
        );

        expect(generatedCFI).toEqual('/4/2[startParent],/3:2,/7:6');
      });

      it('generates for an element with comments in a text node', () => {
        // prettier-ignore
        const dom =
                    "<html>"
                    +    "<div></div>"
                    +    "<div>"
                    +         "<div id='startParent'>"
                    +             "textnode"
                    +             "<!-- comment -->" // 16
                    +             "textnode"
                    +         "</div>"
                    +     "</div>"
                    +     "<div></div>"
                    + "</html>";
        const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

        const $startElement = $($('#startParent', $dom).contents()[0]);
        const $endElement = $($('#startParent', $dom).contents()[2]);
        const generatedCFI = Generator.generateCharOffsetRangeComponent(
          $startElement[0],
          4,
          $endElement[0],
          4,
        );

        expect(generatedCFI).toEqual('/4/2[startParent],/1:4,/1:28');
      });

      it('generates for an element starting with a comment', () => {
        // prettier-ignore
        const dom =
                    "<html>"
                    +    "<div></div>"
                    +    "<div>"
                    +         "<div id='startParent'>"
                    +             "<!-- comment -->" // 16
                    +             "textnode"
                    +         "</div>"
                    +     "</div>"
                    +     "<div></div>"
                    + "</html>";
        const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

        const $startElement = $($('#startParent', $dom).contents()[1]);
        const $endElement = $($('#startParent', $dom).contents()[1]);
        const generatedCFI = Generator.generateCharOffsetRangeComponent(
          $startElement[0],
          4,
          $endElement[0],
          8,
        );

        expect(generatedCFI).toEqual('/4/2[startParent],/1:20,/1:24');
      });
      it('generates for an element with a processing instruction', () => {
        // prettier-ignore
        const dom =
                    "<html>"
                    +    "<div></div>"
                    +    "<div>"
                    +         "<div id='startParent'>"
                    +             "textnode"
                    +             "<?xml-stylesheet type='text/css' href='style.css'?>" // 51
                    +             "textnode"
                    +         "</div>"
                    +     "</div>"
                    +     "<div></div>"
                    + "</html>";
        const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

        const $startElement = $($('#startParent', $dom).contents()[0]);
        const $endElement = $($('#startParent', $dom).contents()[2]);
        const generatedCFI = Generator.generateCharOffsetRangeComponent(
          $startElement[0],
          4,
          $endElement[0],
          4,
        );

        expect(generatedCFI).toEqual('/4/2[startParent],/1:4,/1:63');
      });
      it('generates for an element with a processing instruction at the begining', () => {
        // prettier-ignore
        const dom =
                    "<html>"
                    +    "<div></div>"
                    +    "<div>"
                    +         "<div id='startParent'>"
                    +             "<?xml-stylesheet type='text/css' href='style.css'?>" // 51
                    +             "textnode"
                    +         "</div>"
                    +     "</div>"
                    +     "<div></div>"
                    + "</html>";
        const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

        const $startElement = $($('#startParent', $dom).contents()[1]);
        const $endElement = $($('#startParent', $dom).contents()[1]);
        const generatedCFI = Generator.generateCharOffsetRangeComponent(
          $startElement[0],
          4,
          $endElement[0],
          8,
        );

        expect(generatedCFI).toEqual('/4/2[startParent],/1:55,/1:59');
      });
      it('generates offsets with a simple node', () => {
        // prettier-ignore
        const dom =
                    "<html>"
                    +    "<div></div>"
                    +    "<div>"
                    +         "<div id='startParent'>"
                    +             "0123456789"
                    +         "</div>"
                    +     "</div>"
                    +     "<div></div>"
                    + "</html>";
        const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

        const $startElement = $($('#startParent', $dom).contents()[0]);
        const $endElement = $($('#startParent', $dom).contents()[0]);

        // //////////////////////////////////////////////
        // test 1
        let generatedCFI = Generator.generateCharOffsetRangeComponent(
          $startElement[0],
          0,
          $endElement[0],
          1,
          ['cfi-marker'],
        );
        expect(generatedCFI).toEqual('/4/2[startParent],/1:0,/1:1');

        // //////////////////////////////////////////////
        // test 2
        generatedCFI = Generator.generateCharOffsetRangeComponent(
          $startElement[0],
          1,
          $endElement[0],
          2,
          ['cfi-marker'],
        );
        expect(generatedCFI).toEqual('/4/2[startParent],/1:1,/1:2');

        // //////////////////////////////////////////////
        // test 2
        generatedCFI = Generator.generateCharOffsetRangeComponent(
          $startElement[0],
          2,
          $endElement[0],
          4,
          ['cfi-marker'],
        );
        expect(generatedCFI).toEqual('/4/2[startParent],/1:2,/1:4');
      });

      it('generates offsets with the same parent element', () => {
        // prettier-ignore
        const dom =
                    "<html>"
                    +    "<div></div>"
                    +    "<div>"
                    +         "<div id='startParent'>"
                    +             "<div>content</div>"
                    +             "textnode1"
                    +             "<div></div>"
                    +             "textNode2"
                    +             "<div>content</div>"
                    +         "</div>"
                    +     "</div>"
                    +     "<div></div>"
                    + "</html>";
        const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

        const $startElement = $($('#startParent', $dom).contents()[1]);
        const $endElement = $($('#startParent', $dom).contents()[3]);
        const generatedCFI = Generator.generateCharOffsetRangeComponent(
          $startElement[0],
          2,
          $endElement[0],
          6,
        );

        expect(generatedCFI).toEqual('/4/2[startParent],/3:2,/5:6');
      });

      it('generates offsets with the same parent element and a blacklist element', () => {
        // prettier-ignore
        const dom =
                    "<html>"
                    +    "<div></div>"
                    +    "<div>"
                    +         "<div id='startParent'>"
                    +             "012"
                    +             "<span class='cfi-marker' id='start'></span>"
                    +             "34"
                    +             "<span class='cfi-marker' id='end'></span>"
                    +             "56789"
                    +         "</div>"
                    +     "</div>"
                    +     "<div></div>"
                    + "</html>";
        const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

        const $startElement = $($('#startParent', $dom).contents()[4]);
        const $endElement = $($('#startParent', $dom).contents()[4]);
        const generatedCFI = Generator.generateCharOffsetRangeComponent(
          $startElement[0],
          0,
          $endElement[0],
          3,
          ['cfi-marker'],
        );

        expect(generatedCFI).toEqual('/4/2[startParent],/1:5,/1:8');
      });

      it('generates offsets with the same parent element and a blacklist element #2', () => {
        // prettier-ignore
        const dom =
                    "<html>"
                    +    "<div></div>"
                    +    "<div>"
                    +         "<div id='startParent'>"
                    +             "0"
                    +             "<span class='cfi-marker' id='start'></span>"
                    +             "12345"
                    +             "<span class='cfi-marker' id='end'></span>"
                    +             "6789"
                    +         "</div>"
                    +     "</div>"
                    +     "<div></div>"
                    + "</html>";
        const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

        const $startElement = $($('#startParent', $dom).contents()[4]);
        const $endElement = $($('#startParent', $dom).contents()[4]);
        const generatedCFI = Generator.generateCharOffsetRangeComponent(
          $startElement[0],
          0,
          $endElement[0],
          2,
          ['cfi-marker'],
        );

        expect(generatedCFI).toEqual('/4/2[startParent],/1:6,/1:8');
      });

      it('generates offsets with the same parent element and two blacklist elements', () => {
        // prettier-ignore
        const dom =
                    "<html>"
                    +    "<div></div>"
                    +    "<div>"
                    +         "<div id='startParent'>"
                    +             "This is <span class='cfi-marker'>a</span> line <span class='cfi-marker'>of</span> text"
                    +         "</div>"
                    +     "</div>"
                    +     "<div></div>"
                    + "</html>";
        const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));
        const $startElement = $($('#startParent', $dom).contents()[4]);
        const $endElement = $($('#startParent', $dom).contents()[4]);
        const generatedCFI = Generator.generateCharOffsetRangeComponent(
          $startElement[0],
          0,
          $endElement[0],
          4,
          ['cfi-marker'],
        );

        expect(generatedCFI).toEqual('/4/2[startParent],/1:14,/1:18');
      });
    });
  });

  describe('path generation', () => {
    it('can generate CFI steps recursively for a single content document', () => {
      // prettier-ignore
      const dom =
                "<html>"
                +    "<div></div>"
                +    "<div>"
                +         "<div id='startParent'>"
                +             "<div></div>"
                +             "textnode1"
                +             "<div></div>"
                +             "textNode2"
                +             "<div></div>"
                +         "</div>"
                +     "</div>"
                +     "<div></div>"
                + "</html>";
      const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

      const generatedCFI = Generator.createCFIElementSteps(
        $($('#startParent', $dom).contents()[0]),
        'html',
      );
      expect(generatedCFI).toEqual('/4/2[startParent]/2');
    });

    it('can generate CFI steps recursively for a non-html content document (SVG)', () => {
      // prettier-ignore
      const dom =
                "<svg>"
                +     "<g></g>"
                +     "<g>"
                +          "<text id='startParent'>"
                +               "<tspan></tspan>"
                +          "</text>"
                +     "</g>"
                +     "<g></g>"
                + "</svg>";
      const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));

      const generatedCFI = Generator.createCFIElementSteps(
        $($('#startParent', $dom).contents()[0]),
        $dom[0].documentElement,
      );
      expect(generatedCFI).toEqual('/4/2[startParent]/2');
    });

    it('can infer the presence of a single node from multiple adjacent nodes', () => {
      // prettier-ignore
      const dom =
                "<html>"
                +    "<div></div>"
                +    "<div>"
                +         "<div id='startParent'>"
                +             "<div></div>"
                +             "textnode1.0"
                +             "<div class='cfi-marker'></div>"
                +             "textnode1.1"
                +             "<div class='cfi-marker'></div>"
                +             "textnode1.2"
                +             "<div></div>"
                +             "textNode2"
                +             "<div></div>"
                +         "</div>"
                +     "</div>"
                +     "<div></div>"
                + "</html>";
      const $dom = $(new window.DOMParser().parseFromString(dom, 'text/xml'));
      const $startNode = $($('#startParent', $dom).contents()[5]);
      const textTerminus = Generator.createCFITextNodeStep($startNode, 3, ['cfi-marker']);
      const generatedCFI =
        Generator.createCFIElementSteps($startNode.parent(), 'html', ['cfi-marker']) + textTerminus;

      expect(generatedCFI).toEqual('/4/2[startParent]/3:25'); // [ te,xtn]
    });

    it('can generate a package document CFI with the spine index', () => {
      // prettier-ignore
      const packageDocXhtml =
                "<package>"
                +   "<div></div>"
                +   "<div></div>"
                +   "<div>"
                +       "<spine>"
                +           "<itemref></itemref>"
                +           "<itemref></itemref>"
                +           "<itemref idref='contentDocId'></itemref>"
                +       "</spine>"
                +   "</div>"
                + "</package>";

      const packageDoc = new window.DOMParser().parseFromString(packageDocXhtml, 'text/xml');
      const packageDocCFIComponent = Generator.generatePackageDocumentCFIComponentWithSpineIndex(
        2,
        packageDoc,
      );
      expect(packageDocCFIComponent).toEqual('/6/2/6!'); // [ te,xtn]
    });

    it('can generate a package document CFI with the spine index (XML document with namespace)', () => {
      // prettier-ignore
      const packageDocXhtml =
                "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>"
                + "<opf:package xmlns:opf=\"http://www.idpf.org/2007/opf\" version=\"2.0\">"
                +    "<opf:metadata></opf:metadata>"
                +    "<opf:manifest></opf:manifest>"
                +    "<opf:spine>"
                +      "<opf:itemref/>"
                +      "<opf:itemref/>"
                +      "<opf:itemref idref=\"contentDocId\"/>"
                +    "</opf:spine>"
                + "</opf:package>";

      const packageDoc = new window.DOMParser().parseFromString(packageDocXhtml, 'text/xml');
      const packageDocCFIComponent = Generator.generatePackageDocumentCFIComponentWithSpineIndex(
        2,
        packageDoc,
      );
      expect(packageDocCFIComponent).toEqual('/6/6!');
    });

    it('can generate a package document CFI with the spine idref', () => {
      // prettier-ignore
      const packageDocXhtml =
                "<package>"
                +   "<div></div>"
                +   "<div></div>"
                +   "<div>"
                +       "<spine>"
                +           "<itemref></itemref>"
                +           "<itemref></itemref>"
                +           "<itemref idref='contentDocId'></itemref>"
                +       "</spine>"
                +   "</div>"
                + "</package>";

      const packageDoc = new window.DOMParser().parseFromString(packageDocXhtml, 'text/xml');
      const packageDocCFIComponent = Generator.generatePackageDocumentCFIComponent(
        'contentDocId',
        packageDoc,
      );
      expect(packageDocCFIComponent).toEqual('/6/2/6!');
    });

    it('can generate a package document CFI with the spine idref (XML document with namespace)', () => {
      // prettier-ignore
      const packageDocXhtml =
                "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>"
                + "<opf:package xmlns:opf=\"http://www.idpf.org/2007/opf\" version=\"2.0\">"
                +    "<opf:metadata></opf:metadata>"
                +    "<opf:manifest></opf:manifest>"
                +    "<opf:spine>"
                +      "<opf:itemref/>"
                +      "<opf:itemref/>"
                +      "<opf:itemref idref=\"contentDocId\"/>"
                +    "</opf:spine>"
                + "</opf:package>";

      const packageDoc = new window.DOMParser().parseFromString(packageDocXhtml, 'text/xml');
      const packageDocCFIComponent = Generator.generatePackageDocumentCFIComponent(
        'contentDocId',
        packageDoc,
      );
      expect(packageDocCFIComponent).toEqual('/6/6!');
    });

    it('can generate a complete CFI for both the content document and package document', () => {
      // prettier-ignore
      const packageDocXhtml =
                "<package>"
                +   "<div></div>"
                +   "<div></div>"
                +   "<div>"
                +       "<spine>"
                +           "<itemref></itemref>"
                +           "<itemref></itemref>"
                +           "<itemref idref='contentDocId'></itemref>"
                +       "</spine>"
                +   "</div>"
                + "</package>";

      // prettier-ignore
      const contentDocXhtml =
                "<html>"
                +   "<div></div>"
                +   "<div>"
                +       "<div id='startParent'>"
                +           "<div></div>"
                +           "textnode1"
                +           "<div></div>"
                +           "textNode2"
                +           "<div></div>"
                +       "</div>"
                +   "</div>"
                +   "<div></div>"
                + "</html>";

      const contentDoc = new window.DOMParser().parseFromString(contentDocXhtml, 'text/xml');
      const packageDoc = new window.DOMParser().parseFromString(packageDocXhtml, 'text/xml');

      const contentDocCFIComponent = Generator.generateCharacterOffsetCFIComponent(
        $('#startParent', contentDoc).contents()[1],
        3,
      );
      const packageDocCFIComponent = Generator.generatePackageDocumentCFIComponent(
        'contentDocId',
        packageDoc,
      );
      const generatedCFI = Generator.generateCompleteCFI(
        packageDocCFIComponent,
        contentDocCFIComponent,
      );

      expect(generatedCFI).toEqual('epubcfi(/6/2/6!/4/2[startParent]/3:3)'); // [ te,xtn]
    });

    it('can generate a CFI for an actual epub', () => {
      const contentDocXhtml = fixtureMobyDickContentDoc;
      const contentDoc = new window.DOMParser().parseFromString(contentDocXhtml, 'text/xml');
      const packageDocXhtml = fixtureMobyDickPackage;
      const packageDoc = new window.DOMParser().parseFromString(packageDocXhtml, 'text/xml');

      const contentDocCFIComponent = Generator.generateCharacterOffsetCFIComponent(
        $('#c01p0008', contentDoc)[0].firstChild,
        103,
      );
      const packageDocCFIComponent = Generator.generatePackageDocumentCFIComponent(
        'xchapter_001',
        packageDoc,
      );
      const generatedCFI = Generator.generateCompleteCFI(
        packageDocCFIComponent,
        contentDocCFIComponent,
      );

      expect(generatedCFI).toEqual('epubcfi(/6/14!/4[body1]/2/18[c01p0008]/1:103)'); // [, a,lof]
    });

    it('can generate a CFI without a terminus', () => {
      const contentDocXhtml = fixtureMobyDickContentDoc;
      const contentDoc = new window.DOMParser().parseFromString(contentDocXhtml, 'text/xml');
      const packageDocXhtml = fixtureMobyDickPackage;
      const packageDoc = new window.DOMParser().parseFromString(packageDocXhtml, 'text/xml');

      const contentDocCFIComponent = Generator.generateElementCFIComponent(
        $('#c01p0008', contentDoc)[0],
      );
      const packageDocCFIComponent = Generator.generatePackageDocumentCFIComponent(
        'xchapter_001',
        packageDoc,
      );
      const generatedCFI = Generator.generateCompleteCFI(
        packageDocCFIComponent,
        contentDocCFIComponent,
      );

      expect(generatedCFI).toEqual('epubcfi(/6/14!/4[body1]/2/18[c01p0008])');
    });

    it("can generate a CFI without a terminus when the start element is the 'html' element", () => {
      const contentDocXhtml = fixtureMobyDickContentDoc;
      const contentDoc = new window.DOMParser().parseFromString(contentDocXhtml, 'text/xml');
      const packageDocXhtml = fixtureMobyDickPackage;
      const packageDoc = new window.DOMParser().parseFromString(packageDocXhtml, 'text/xml');

      const contentDocCFIComponent = Generator.generateElementCFIComponent(
        $('html', contentDoc)[0],
      );
      const packageDocCFIComponent = Generator.generatePackageDocumentCFIComponent(
        'xchapter_001',
        packageDoc,
      );
      const generatedCFI = Generator.generateCompleteCFI(
        packageDocCFIComponent,
        contentDocCFIComponent,
      );

      expect(generatedCFI).toEqual('epubcfi(/6/14!/2)');
    });
  });

  describe('CFI GENERATOR ERROR HANDLING', () => {
    let contentDocXhtml;
    let contentDoc;
    let packageDocXhtml;
    let packageDoc;
    let startTextNode;

    beforeEach(() => {
      contentDocXhtml = fixtureMobyDickContentDoc;
      contentDoc = new window.DOMParser().parseFromString(contentDocXhtml, 'text/xml');
      packageDocXhtml = fixtureMobyDickPackage;
      packageDoc = new window.DOMParser().parseFromString(packageDocXhtml, 'text/xml');
      startTextNode = $('#c01p0008', contentDoc)[0].firstChild;
    });

    it('throws an error if a text node is not supplied as a starting point', () => {
      expect(() => {
        Generator.generateCharacterOffsetCFIComponent(undefined, 103, 'xchapter_001', packageDoc);
      }).toThrow(
        new NodeTypeError(
          undefined,
          'Cannot generate a character offset from a starting point that is not a text node',
        ),
      );
    });

    it('throws an error if the character offset is less then 0', () => {
      expect(() => {
        Generator.generateCharacterOffsetCFIComponent(
          startTextNode,
          -1,
          'xchapter_001',
          packageDoc,
        );
      }).toThrow(new OutOfRangeError(-1, 0, 'Character offset cannot be less than 0'));
    });

    it('throws an error if the character offset is greater than the length of the text node', () => {
      expect(() => {
        Generator.generateCharacterOffsetCFIComponent(
          startTextNode,
          startTextNode.nodeValue.length + 1,
          'xchapter_001',
          packageDoc,
        );
      }).toThrow(
        new OutOfRangeError(
          startTextNode.nodeValue.length + 1,
          startTextNode.nodeValue.length,
          'character offset cannot be greater than the length of the text node',
        ),
      );
    });

    it('throws an error if an idref is not supplied', () => {
      expect(() => {
        Generator.generatePackageDocumentCFIComponent(undefined, packageDoc);
      }).toThrow(
        new Error('The idref for the content document, as found in the spine, must be supplied'),
      );
    });

    it('throws an error if a package document is not supplied', () => {
      expect(() => {
        Generator.generatePackageDocumentCFIComponent('xchapter_001', undefined);
      }).toThrow(new Error('A package document must be supplied to generate a CFI'));
    });

    it('throws an error if the idref does not match any idref attribute on itemref elements in the spine', () => {
      expect(() => {
        Generator.generatePackageDocumentCFIComponent('xchapter_', packageDoc);
      }).toThrow(new Error('The idref of the content document could not be found in the spine'));
    });

    it('throws an error if target element is undefined', () => {
      expect(() => {
        Generator.validateStartElement(undefined);
      }).toThrow(new Error('CFI target element is undefined'));
    });

    it('throws an error if target element is not an HTML element', () => {
      expect(() => {
        Generator.validateStartElement(document.createTextNode('a text node'));
      }).toThrow(new Error('CFI target element is not an HTML element'));
    });
  });
});
