// This file is imported by Jest to avoid a React Warning:
//     Warning: React depends on requestAnimationFrame. Make sure that you load a
//     polyfill in older browsers. http://fb.me/react-polyfills
// See https://github.com/facebook/jest/issues/4545#issuecomment-332762365 for details

global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
};
