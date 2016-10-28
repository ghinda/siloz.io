/* header
 */

var durruti = require('durruti')
var Settings = require('./settings')
var Share = require('./share')

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
        ${durruti.render(new Share(actions))}
      </header>
    `
  }
}

module.exports = Header
