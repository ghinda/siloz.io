/* about
 */

var util = require('../../util')
var Popup = require('../popup')

function Help (actions, actionsInternal) {
  var self = util.inherits(this, Popup)
  Popup.call(self, 'about', actionsInternal)

  self.mount = self.super.mount.bind(self)
  self.unmount = self.super.unmount.bind(self)

  self.render = () => {
    return self.super.render.call(self, 'About', `
      <p>
        <a href="/">siloz.io</a> is a private code playground in the browser.
      </p>

      <p>
        Your source code is saved in the URL and never reaches our servers.
      </p>

      <p>
        Use HTML, CSS and JavaScript, along with processors like CoffeeScript, Babel/ES2015, Less, Stylus or Markdown.
      </p>

      <p>
        <a href="https://github.com/ghinda/siloz.io" target="_blank">
          Source code available on GitHub.
        </a>
      </p>
    `)
  }

  return self
}

module.exports = Help
