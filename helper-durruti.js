var durruti = require('durruti')

module.exports.register = function (Handlebars, options)  {
  Handlebars.registerHelper('durruti', function (url)  {
    var component = require(url)
    return new Handlebars.SafeString(durruti.render(component))
  })
}

