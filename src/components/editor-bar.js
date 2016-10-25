/* editor bar
 */

function EditorBar (actions) {
  var plugins = actions.getPlugins()
  var options = {
    html: [{
      title: 'HTML'
    }, {
      title: 'Markdown',
      plugin: 'markdown'
    }],
    css: [{
      title: 'CSS'
    }, {
      title: 'Less',
      plugin: 'less'
    }, {
      title: 'Stylus',
      plugin: 'stylus'
    }],
    js: [{
      title: 'JavaScript'
    }, {
      title: 'ES2015/Babel',
      plugin: 'babel'
    }, {
      title: 'CoffeeScript',
      plugin: 'coffeescript'
    }]
  }

  var selected = {
    html: '',
    css: '',
    js: ''
  }

  function getPlugin (list, name) {
    var foundPlugin = null
    list.some((plugin) => {
      if (plugin.plugin === name) {
        foundPlugin = plugin
        return true
      }
    })

    return foundPlugin
  }

  function change (type) {
    return function () {
      // remove last selected plugin
      actions.removePlugin(selected[type])

      // update reference
      selected[type] = this.value

      var plugin = getPlugin(options[type], selected[type])
      if (plugin) {
        actions.addPlugin(plugin.plugin)
      }
    }
  }

  function createSelect (type, options, selected) {
    return `
      <select class="editor-bar-select editor-bar-select-${type}">
        ${options.map((opt) => {
          return `
            <option value="${opt.plugin || ''}" ${opt.plugin === selected ? 'selected' : ''}>
              ${opt.title}
            </option>
          `
        }).join('')}
      </select>
    `
  }

  function setInitialValues () {
    // set selected values based on store
    Object.keys(options).forEach((type) => {
      options[type].forEach((option) => {
        if (plugins.indexOf(option.plugin) !== -1) {
          selected[type] = option.plugin
        }
      })
    })
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
