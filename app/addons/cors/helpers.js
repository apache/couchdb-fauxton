import FauxtonAPI from "../../core/api";
// import Resources from "./resources";

/**
 * Returns true if 'domain' is a valid domain name. Otherwise returns false and notifies the user.
 *
 * @param {string} domain
 * @returns {boolean}
 */
export function validateDomain(domain) {
  console.log('\n>>>> validateDomain:', domain, '<<<');
  if (!(/^https?:\/\/(.+)(:\d{2,5})?$/).test(domain)) {
    FauxtonAPI.addNotification({
      msg: 'Please enter a valid domain, starting with http/https.',
      type: 'error',
      clear: true
    });

    return false;
  }

  return true;
}

export function normalizeUrls (url) {
  const el = document.createElement('a');
  el.href = url;

  if (/:/.test(url)) {
    return el.protocol + '//' + el.host;
  }

  return el.protocol + '//' + el.hostname;
};

// export function validateCORSDomain (str) {
//   return (/^https?:\/\/(.+)(:\d{2,5})?$/).test(str);
// };


