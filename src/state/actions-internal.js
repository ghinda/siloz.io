/* store actions
 */

function actions (store) {
  function getPopup (name) {
    return store.get().popup[name]
  }

  function updatePopup (name, state) {
    var data = store.get()
    data.popup[name] = state

    store.set(data)
  }

  return {
    getPopup: getPopup,
    updatePopup: updatePopup
  }
}

module.exports = actions
