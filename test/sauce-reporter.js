/* sauce reporter for tape
 */

var tape = require('tape')

var tests = []
var title = ''

function parse (line) {
  if (typeof line !== 'string') {
    return
  }

  if (line.indexOf('#') === 0) {
    title = line.substr(2)
    return
  }

  if (line.indexOf('ok') === 0) {
    return {
      name: title,
      result: true,
      message: line
    }
  }

  if (line.indexOf('not ok') === 0) {
    return {
      name: title,
      result: false,
      message: line
    }
  }
}

// ie9 with console closed
if (typeof window.console === 'undefined') {
  window.console = {
    log: function () {}
  }
}

// for ie9 console.log.apply
var olog = Function.prototype.bind.call(window.console.log, window.console)

window.console.log = function () {
  var parsedResult = parse(arguments[0])
  if (parsedResult) {
    tests.push(parsedResult)
  }

  olog.apply(this, arguments)
}

var startTime = Date.now()

tape.onFinish(function () {
  var _results = tape.getHarness()._results

  window.global_test_results = {
    failed: _results.fail,
    passed: _results.pass,
    total: _results.count,
    duration: Date.now() - startTime,
    tests: tests
  }
})
