# firstOccurrence.js

Searches recursively for the first text occurrence and wraps it with a given class name

Input
```
    <table>
      <tr id="demo">
        <td>Hey</td>
        <td>how</td>
        <td>are</td>
        <td>
          <span>you</span><strong>?</strong>
        </td>
      </tr>
    </table>
```

Wrapping
```
firstOccurrence.addClass(document.getElementById('demo'),'how are yo', 'blue');
```

Output
```
    <table>
      <tr id="demo">
        <td>Hey</td>
        <td><span class='blue'>how</span></td>
        <td><span class='blue'>are</span></td>
        <td>
          <span><span class='blue'>yo</span>u</span><strong>?</strong>
        </td>
      </tr>
    </table>
```

Unwrapping
```
firstOccurrence.addClass(document.getElementById('demo'),'how are yo', 'blue');
firstOccurrence.removeClass(document.getElementById('demo'), 'blue');
```

```
    <table>
      <tr id="demo">
        <td>Hey</td>
        <td>how</td>
        <td>are</td>
        <td>
          <span>you</span><strong>?</strong>
        </td>
      </tr>
    </table>
```

See the [tests](http://jantimon.github.io/firstOccurrence.js/test/)