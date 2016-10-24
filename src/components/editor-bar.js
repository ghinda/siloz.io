/* editor bar
 */


function EditorBar (actions) {
  this.mount = function ($container) {

  }

  this.render = function () {
    return `
      <div class="editor-bar">
        <div class="editor-bar-pane editor-bar-pane-html">
          <select class="editor-bar-select">
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
