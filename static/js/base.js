function showToast(messageText, timeout = 1000) {
  Snackbar.MaterialSnackbar.showSnackbar({
    'message': messageText,
    'timeout': timeout,
  });
}

function update_options(url, options) {
  options = options || {}
  if (options['body']) {
    options['body'] = JSON.stringify(options['body']);
  }
  options['headers'] = options['headers'] || {}
  options['headers']['Content-Type'] = 'application/json';
  if (options['params']) {
    url = url + '?' + Object.entries(options['params']).map(([k, v]) => `${k}=${v}`).join('&');
  }
  return [`${url}`, options];
}

function fetch_json(url, options, need_json = true) {
  return fetch(...update_options(url, options)).then(res => {
    if (res.ok) {
      if (need_json) {
        return res.json();
      } else {
        return res;
      }
    } else {
      throw new Error('请求失败。');
    }
  }).catch(e => {
    console.log(e);
    showToast(`请求失败`, 500);
    throw e;
  });
}

export { showToast, fetch_json };
