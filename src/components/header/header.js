/* header
 */

var durruti = require('durruti')
var Settings = require('./settings')

function Header (actions) {
  this.render = function () {
    return `
      <header class="header">
        <a href="/" class="header-logo">
          <h1>
            siloz.io
          </h1>
        </a>

        ${durruti.render(new Settings(actions))}
      </header>
    `
  }
}

module.exports = Header
