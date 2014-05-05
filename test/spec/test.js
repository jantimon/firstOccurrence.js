/*global describe, it, expect, firstOccurrence, jQuery */

(function ($) {
  'use strict';

  function createDemoElement() {
      var demoDomElement = document.createElement('div');
      demoDomElement.innerHTML = [
        '<table>',
        '  <tr>',
        '    <td> Hey</td>',
        '    <td>how</td>',
        '    <td>are</td>',
        '    <td>',
        '      <span>you</span> <strong>?</strong>',
        '    </td>',
        '  </tr>',
        '</table>'
      ].join('\n');
      return demoDomElement;
    }


    describe('firstOccurrence', function () {

        describe('text node extractor', function() {
          it('should extract all text nodes', function () {
            var demo = createDemoElement();
            var nodes = firstOccurrence.getTextNodes(demo);
            expect(nodes.length).toBe(15);
          });
        });

        describe('search', function() {
          it('should find all text nodes', function () {
            var demo = createDemoElement();
            var nodes = firstOccurrence.getTextNodes(demo);
            expect(nodes[2].nodeValue).toBe(' Hey');
          });
          it('should detect the text nodes holding the words "are you?"', function () {
            var demo = createDemoElement();
            var nodes = firstOccurrence.getTextNodes(demo);
            var matches = firstOccurrence.getMatchingTextNodes(firstOccurrence.removeMultipleWhiteSpaces($(demo).text()), 'are you', false, nodes);

            expect(matches.nodes[0].nodeValue).toBe('are');
            expect(matches.start).toBe(0);
          });
          it('should detect the text nodes holding the words "re you?"', function () {
            var demo = createDemoElement();
            var nodes = firstOccurrence.getTextNodes(demo);
            var matches = firstOccurrence.getMatchingTextNodes(firstOccurrence.removeMultipleWhiteSpaces($(demo).text()), 're you ?', true, nodes);

            expect(matches.nodes[0].nodeValue).toBe('are');
            expect(matches.start).toBe(1);
          });
          it('should detect the text nodes holding the words "ho"', function () {
            var demo = createDemoElement();
            var nodes = firstOccurrence.getTextNodes(demo);
            var matches = firstOccurrence.getMatchingTextNodes(firstOccurrence.removeMultipleWhiteSpaces($(demo).text()), 'ho', true, nodes);

            expect(matches.nodes[0].nodeValue).toBe('how');
            expect(matches.end).toBe(2);
          });
        });

        describe('main', function() {
          it('should detect the text nodes holding the words "re you?"', function () {
            var demo = createDemoElement();
            document.body.appendChild(demo);
            firstOccurrence.addClass(demo, 're you ?', 'red');
            firstOccurrence.addClass(demo, 'hey ho', 'blue');

            expect($('.red', demo).length).toBe(4);
          });

          it('should undo wrapping "re you?"', function () {
            var demo = createDemoElement();
            var nodesBefore = firstOccurrence.getTextNodes(demo);

            document.body.appendChild(demo);
            firstOccurrence.addClass(demo, 're you ?', 'red');
            firstOccurrence.addClass(demo, 'hey ho', 'blue');
            firstOccurrence.removeClass(demo, 'red');
            firstOccurrence.removeClass(demo, 'blue');

            var nodesAfter = firstOccurrence.getTextNodes(demo);

            expect(nodesBefore.length).toBe(nodesAfter.length);
          });

        });

    });

})(jQuery);
