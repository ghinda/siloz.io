/* editor bar
 */

function EditorBar (actions) {
  function changeHtml (e) {
    if (this.value === 'markdown') {
      actions.addPlugin('markdown')
    }
  }

//   function setSelectValue () {
//     // TODO on load set select values based on store
//   }

  this.mount = function ($container) {
    $container.querySelector('.editor-bar-select-html').addEventListener('change', changeHtml)
  }

  this.render = function () {
    return `
      <div class="editor-bar">
        <div class="editor-bar-pane editor-bar-pane-html">
          <select class="editor-bar-select editor-bar-select-html">
            <option value="html">
              HTML
            </option>
            <option value="markdown">
              Markdown
            </option>
          </select>
        </div>
        <div class="editor-bar-pane editor-bar-pane-html">
          <select class="editor-bar-select">
            <option value="css">
              CSS
            </option>
            <option value="less">
              Less
            </option>
            <option value="stylus">
              Stylus
            </option>
          </select>
        </div>
        <div class="editor-bar-pane editor-bar-pane-html">
          <select class="editor-bar-select">
            <option value="javascript">
              JavaScript
            </option>
            <option value="es2015">
              ES2015
            </option>
            <option value="coffeescript">
              CoffeeScript
            </option>
          </select>
        </div>
      </div>
    `
  }
}

module.exports = EditorBar
