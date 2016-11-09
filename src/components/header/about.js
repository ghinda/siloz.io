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

      <h2>
        Short URLs
      </h2>

      <p>
        siloz.io can generate shorter urls, at a privacy cost.
      </p>

      <p>
        When a short url is generated, the current url that includes the source code is saved on the server.
      </p>

      <p>
        To be able to update the source code of the same short url, a unique token is generated and saved on the server and the client.
      </p>

      <p>
        We run our own open-source url shortener (<a href="https://github.com/ghinda/prajina" target="_blank">prajina</a>).
      </p>
    `)
  }

  return self
}

module.exports = Help
