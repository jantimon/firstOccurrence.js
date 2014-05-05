/* global jQuery */
var firstOccurrence = (function ($) {
  'use strict';

  /**
   * The main function which wraps the first occurrence of the text into
   * a span and adds the given class.
   *
   * @example
   * // Demo html:
   * // <table id='demo'><tr><td><strong>Lorem</strong> ipsum</td><td>dolor sit</td></tr></table>
   * var demo = document.getElementById('demo');
   * firstOccurrence(demo, 'rem ipsum do', 'search-match');
   *
   * @param element
   *  The element where the search should take place
   * @param search {String}
   *  The search text
   * @param className {String}
   *  The class name which should be set to the wrapping span(s)
   * @param caseSensitive {boolean}
   *  Optional - default: false
   *  If set to true the search string has to match case sensitively
   *
   * @returns {boolean}
   */
  function addClass(element, search, className, caseSensitive) {
    // Trim text
    var text = removeMultipleWhiteSpaces($(element).text());
    search = removeMultipleWhiteSpaces(search);
    // Skip if a case sensitive search does not match
    if (caseSensitive && text.indexOf(search) < 0) {
      return false;
    }
    // Skip if a non case sensitive search does not match
    if (!caseSensitive && text.toLowerCase().indexOf(search.toLowerCase()) < 0) {
      return false;
    }

    // Get all text nodes
    var $elementTextNodes = getTextNodes(element);

    // Search for the first match
    var matchingTextNodeResult = getMatchingTextNodes(text, search, !!caseSensitive, $elementTextNodes);
    var matchingTextNodes = matchingTextNodeResult.nodes;

    // Wrap the match
    for (var i = 0; i < matchingTextNodes.length; i++) {
      var start = i === 0 ? matchingTextNodeResult.start : false;
      var end = i === matchingTextNodes.length - 1 ? matchingTextNodeResult.end : false;
      wrapTextNode(matchingTextNodes[i], className, start, end);
    }

    return true;
  }

  /**
   * Removes the class by replacing the wrapping spans
   *
   * @param element
   * @param className
   */
  function removeClass(element, className) {
   $('.' + className, element).each(function(){
     unwrap(this);
   });
  }

  /**
   * Unwraps the given span element and merges it with the surrounding
   * text nodes
   *
   * @param element
   */
  function unwrap(element) {
    var text = [];
    var elements = [];
    // Add the previous sibling
    var prev = element.previousSibling;
    if(prev && isTextNode(prev)) {
      text.push(prev.nodeValue);
      elements.push(prev);
    }
    // Add the child nodes
    for (var i = 0; i < element.childNodes.length; i++) {
      elements.push(element);
      if (isTextNode(element.childNodes[i])) {
        text.push(element.childNodes[i].nodeValue);
      }
    }
    // Add the next sibling
    var next = element.nextSibling;
    if(next && isTextNode(next)) {
      text.push(next.nodeValue);
      elements.push(next);
    }
    // Insert new textNode
    var textNode = document.createTextNode(text.join(''));
    element.parentNode.insertBefore(textNode, elements[0]);
    // Remove old text nodes
    for(var j = 0; j < elements.length; j++) {
      elements[j].parentNode.removeChild(elements[j]);
    }
  }


  /**
   * Helper function to remove multiple spaces before searching.
   *
   * @param text
   * @returns {String}
   */
  function removeMultipleWhiteSpaces(text) {
    return text.replace(/[\n\r]+/g, '').replace(/[\t ]+/g, ' ');
  }

  /**
   * Returns recursively all textNodes of an element
   *
   * @param $element
   * @returns {jQuery}
   */
  function getTextNodes(element) {
    var texts = [];

    var getTextNodesRecursive = function (element) {
      for (var child = element.firstChild; child !== null; child = child.nextSibling) {
        if (isTextNode(child)) {
          texts.push(child);
        }
        else if (child.nodeType === 1) {
          getTextNodesRecursive(child);
        }
      }
    };

    getTextNodesRecursive(element);
    return texts;
  }

    /**
     * Returns true if the given node is a textNode
     * @param node
     * @returns {boolean}
     */
  function isTextNode(node){
    return node.nodeType === 3;
  }

  /**
   * Returns the nodes which contain the first match of the search
   *
   * @param text - The text of all nodes
   * @param textNodes - The nodes of the text
   * @param caseSensitive
   * @param search
   */
  function getMatchingTextNodes(text, search, caseSensitive, textNodes) {

    // Get the length of each text node
    var nodeValueLengths = $.map(textNodes, function (node) {
      return removeMultipleWhiteSpaces(node.nodeValue).length;
    });

    var start = 0;
    var matchingNodes = [];
    var matchPos = caseSensitive ? text.indexOf(search) : text.toLowerCase().indexOf(search.toLowerCase());
    var matchPosEnd = matchPos + search.length;
    var lastEndedWithSpaces = false;
    var endsWithSpaces, startsWithSpaces, containsOnlySpaces;
    for (var i = 0, pos = 0; i < nodeValueLengths.length && pos < matchPosEnd; i++) {
      // If the element is in range of the result string
      if (pos + nodeValueLengths[i] > matchPos && nodeValueLengths[i] > 0) {
        // Calculate the start of the first match
        if(pos < matchPos) {
          start = matchPos - pos;
        }
        // Push the text node
        matchingNodes.push(textNodes[i]);
      }

      // Check if the node starts or ends with spaces
      containsOnlySpaces = /^\s+$/.test(textNodes[i].nodeValue);
      startsWithSpaces = /^\s+/.test(textNodes[i].nodeValue);
      endsWithSpaces = /\s+$/.test(textNodes[i].nodeValue);
      // Don't count the length if this element and the last
      // one contain only spaces
      if (!lastEndedWithSpaces || !containsOnlySpaces) {
        pos += nodeValueLengths[i];
        // Subtract 1 if the starting space follows a space
        if(lastEndedWithSpaces && startsWithSpaces) {
          pos--;
        }
      }
      lastEndedWithSpaces = endsWithSpaces;
    }

    var end = 0;
    if(matchingNodes.length) {
      end = matchingNodes[matchingNodes.length - 1].length - (pos - matchPosEnd);
    }

    return {
      nodes: matchingNodes,
      start: start,
      end: end
    };
  }


  /**
   * Returns true if the element contains characters or is between two inline elements
   * @param node
   * @returns {boolean}
   */
  function isVisibleTextElement(node){
    // If characters are part of the node it is visible
    if(!/^\s+$/.test(node.nodeValue)) {
      return true;
    }
    // If the previous and the next element is an
    // inline/inline-block element than this node is visible
    var $node = $(node);
    var prevDisplay = $node.prev(':visible').css('display');
    var prevIsInline = prevDisplay === 'inline' || prevDisplay === 'inline-block';
    var nextDisplay = $node.next(':visible').css('display');
    var nextIsInline = nextDisplay === 'inline' || nextDisplay === 'inline-block';
    return prevIsInline && nextIsInline;
  }

  /**
   *
   * @param node
   * @param start
   */
  function wrapTextNode(node, className, start, end) {
    if(!isVisibleTextElement(node)) {
      return;
    }
    if(start) {
      node = splitTextNode(node, start)[1];
    }
    if(end) {
      node = splitTextNode(node, end)[0];
    }
    var span = document.createElement('span');
    span.className = className;
    span.appendChild(document.createTextNode(node.nodeValue));
    node.parentNode.replaceChild(span, node);
  }

  /**
   * Splits a text node into two pieces
   *
   * @param node
   * @param offset
   * @returns {DOM node[]}
   */
  function splitTextNode(node, offset){
    var text = node.nodeValue;
    // Skip if no split is necessary
    if(offset === 0 || offset >= text.length ) {
      return [node];
    }
    // create nodes
    var firstNode = document.createTextNode(text.substr(0, offset));
    var secondNode = document.createTextNode(text.substr(offset));
    var parentNode = node.parentNode;
    // insert nodes
    parentNode.replaceChild(secondNode, node);
    parentNode.insertBefore(firstNode, secondNode);
    return [firstNode, secondNode];
  }

  // Export
  return {
    addClass: addClass,
    removeClass: removeClass,
    unwrap: unwrap,
    // For tests
    getMatchingTextNodes: getMatchingTextNodes,
    getTextNodes: getTextNodes,
    removeMultipleWhiteSpaces: removeMultipleWhiteSpaces
  };

}(jQuery));
