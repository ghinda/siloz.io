/* siloz.io
 */

// vendor
if (typeof window !== 'undefined') {
  window.CodeMirror = require('codemirror')
  require('codemirror/mode/htmlmixed/htmlmixed')
  require('codemirror/mode/css/css')
  require('codemirror/mode/javascript/javascript')
}

var durruti = require('durruti')
var Main = require('./components/main.js')

durruti.render(Main, document.querySelector('.app'))
