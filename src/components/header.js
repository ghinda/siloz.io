/* header
 */

function Header (actions) {
  this.render = function () {
    return `
      <header class="header">
        <a href="/" class="header-logo">
          <h1>
            siloz.io
          </h1>
        </a>
      </header>
    `
  }
}

module.exports = Header
