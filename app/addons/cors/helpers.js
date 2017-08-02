import FauxtonAPI from "../../core/api";
import Resources from "./resources";

/**
 * Returns true if 'domain' is a valid domain name.
 *
 * @param {string} domain
 * @returns {boolean}
 */
export function validateDomain(domain) {
  if (!Resources.validateCORSDomain(domain)) {
    FauxtonAPI.addNotification({
      msg: 'Please enter a valid domain, starting with http/https.',
      type: 'error',
      clear: true
    });

    return false;
  }

  return true;
}
