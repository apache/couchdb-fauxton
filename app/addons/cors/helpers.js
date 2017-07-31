import FauxtonAPI from "../../core/api";
import Resources from "./resources";

export function  validateOrigin (origin) {
  if (!Resources.validateCORSDomain(origin)) {
    FauxtonAPI.addNotification({
      msg: 'Please enter a valid domain, starting with http/https.',
      type: 'error',
      clear: true
    });

    return false;
  }

  return true;
}
