/**
 * Do sth with deboucing
 * Read more about debounce here: https://davidwalsh.name/javascript-debounce-function
 *
 * Usage:
 *    const doSearchWithDebounce = debounce(this.doSearch.bind(this), 200);
 *    onScroll={(e) => doSearchWithDebounce(e)}
 *
 * @param fn
 * @param delay
 * @returns {function()}
 */
export function debounce(fn, delay) {
  let tmpId;
  return (...params) => {
    clearTimeout(tmpId);
    tmpId = setTimeout(() => {
      fn(...params);
    }, delay)
  }
}

export function throttle(fn, interval) {
  let lastUnix = Date.now();

  // have msg then setInterval
  // setTimeout 1s to clear intervalZ
  return (...params) => {
    const curr = Date.now();
    if (curr - lastUnix >= interval) {
      fn(...params);
      lastUnix = curr;
    }
  }
}

export default debounce;