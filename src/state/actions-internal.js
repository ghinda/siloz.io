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

  function getLoading (name) {
    return store.get().loading[name]
  }

  function updateLoading (name, state) {
    var data = store.get()
    data.loading[name] = state

    store.set(data)
  }

  function getQr () {
    return store.get().qr
  }

  function updateQr (url) {
    var data = store.get()
    data.qr = url

    store.set(data)
  }

  return {
    getPopup: getPopup,
    updatePopup: updatePopup,

    getLoading: getLoading,
    updateLoading: updateLoading,

    getQr: getQr,
    updateQr: updateQr
  }
}

module.exports = actions
