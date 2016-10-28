/* editor
 */

var durruti = require('durruti')
var EditorBar = require('./editor-bar')
var EditorWidget = require('./editor-widget')

function Editor (actions) {
  var panes = actions.getPanes()

  this.render = function () {
    return `
      <div class="editor
        ${panes.html.hidden ? 'editor-is-hidden-html' : ''}
        ${panes.css.hidden ? 'editor-is-hidden-css' : ''}
        ${panes.js.hidden ? 'editor-is-hidden-js' : ''}
      ">
        ${durruti.render(new EditorBar(actions))}
        ${durruti.render(new EditorWidget(actions))}
      </div>
    `
  }
}

module.exports = Editor
