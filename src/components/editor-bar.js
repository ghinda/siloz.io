/* editor bar
 */

function EditorBar (actions) {
  var plugins = actions.getPlugins()
  var options = {
    html: [
      'HTML',
      'Markdown'
    ],
    css: [
      'CSS',
      'Less',
      'Stylus'
    ],
    js: [
      'JavaScript',
      'ES2015',
      'CoffeeScript'
    ]
  }

  var selected = {
    html: '',
    css: '',
    js: ''
  }

  var pluginMap = {
    markdown: 'markdown',
    less: 'less',
    stylus: 'stylus'
  }

  function change (type) {
    return function () {
      // remove last selected plugin
      actions.removePlugin(selected[type])

      // update reference
      selected[type] = this.value

      if (pluginMap[selected[type]]) {
        actions.addPlugin(selected[type])
      }
    }
  }

  function createSelect (type, options, selected) {
    return `
      <select class="editor-bar-select editor-bar-select-${type}">
        ${options.map((opt) => {
          return `
            <option value="${opt.toLowerCase()}" ${opt.toLowerCase() === selected ? 'selected' : ''}>
              ${opt}
            </option>
          `
        }).join('')}
      </select>
    `
  }

  function setInitialValues () {
    // TODO on load set select values based on store

    // javascript
    if (plugins.indexOf('markdown') !== -1) {
      selected.html = 'markdown'
    }

    // css
    if (plugins.indexOf('less') !== -1) {
      selected.css = 'less'
    }

    if (plugins.indexOf('stylus') !== -1) {
      selected.css = 'stylus'
    }
  }

  this.mount = function ($container) {
    $container.querySelector('.editor-bar-select-html').addEventListener('change', change('html'))
    $container.querySelector('.editor-bar-select-css').addEventListener('change', change('css'))
    $container.querySelector('.editor-bar-select-js').addEventListener('change', change('js'))
  }

  this.render = function () {
    setInitialValues()

    return `
      <div class="editor-bar">
        <div class="editor-bar-pane editor-bar-pane-html">
          ${createSelect('html', options.html, selected.html)}
        </div>
        <div class="editor-bar-pane editor-bar-pane-css">
          ${createSelect('css', options.css, selected.css)}
        </div>
        <div class="editor-bar-pane editor-bar-pane-js">
          ${createSelect('js', options.js, selected.js)}
        </div>
      </div>
    `
  }
}

module.exports = EditorBar
