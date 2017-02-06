import FauxtonAPI from "../../../core/api";
import {
  AUTH_CLEAR_CREATE_ADMIN_FIELDS,
  AUTH_UPDATE_CREATE_ADMIN_USERNAME_FIELD,
  AUTH_UPDATE_CREATE_ADMIN_PWD_FIELD
} from "./../actiontypes";

const CreateAdminStore = FauxtonAPI.Store.extend({
  initialize() {
    this.reset();
  },
  reset() {
    this._username = "";
    this._password = "";
  },
  getUsername() {
    return this._username;
  },
  getPassword() {
    return this._password;
  },
  setUsername(val) {
    this._username = val;
  },
  setPassword(val) {
    this._password = val;
  },
  dispatch(action) {
    switch (action.type) {
      case AUTH_CLEAR_CREATE_ADMIN_FIELDS:
        this.reset();
        this.triggerChange();
        break;

      case AUTH_UPDATE_CREATE_ADMIN_USERNAME_FIELD:
        this.setUsername(action.value);
        this.triggerChange();
        break;

      case AUTH_UPDATE_CREATE_ADMIN_PWD_FIELD:
        this.setPassword(action.value);
        this.triggerChange();
        break;

      default:
        return;
    }
  }
});

const createAdminStore = new CreateAdminStore();
createAdminStore.dispatchToken = FauxtonAPI.dispatcher.register(
  createAdminStore.dispatch.bind(createAdminStore)
);

export default createAdminStore;
