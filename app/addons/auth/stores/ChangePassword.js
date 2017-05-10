import FauxtonAPI from "../../../core/api";
import ActionTypes from '../actiontypes';
const {
  AUTH_CLEAR_CHANGE_PWD_FIELDS,
  AUTH_UPDATE_CHANGE_PWD_FIELD,
  AUTH_UPDATE_CHANGE_PWD_CONFIRM_FIELD
} = ActionTypes;

const ChangePasswordStore = FauxtonAPI.Store.extend({
  initialize() {
    this.reset();
  },
  reset() {
    this._changePassword = "";
    this._changePasswordConfirm = "";
  },
  getChangePassword() {
    return this._changePassword;
  },
  getChangePasswordConfirm() {
    return this._changePasswordConfirm;
  },
  setChangePassword(val) {
    this._changePassword = val;
  },
  setChangePasswordConfirm(val) {
    this._changePasswordConfirm = val;
  },
  dispatch(action) {
    switch (action.type) {
      case AUTH_CLEAR_CHANGE_PWD_FIELDS:
        this.reset();
        this.triggerChange();
        break;

      case AUTH_UPDATE_CHANGE_PWD_FIELD:
        this.setChangePassword(action.value);
        this.triggerChange();
        break;

      case AUTH_UPDATE_CHANGE_PWD_CONFIRM_FIELD:
        this.setChangePasswordConfirm(action.value);
        this.triggerChange();
        break;

      default:
        return;
    }
  }
});

const changePasswordStore = new ChangePasswordStore();

changePasswordStore.dispatchToken = FauxtonAPI.dispatcher.register(
  changePasswordStore.dispatch.bind(changePasswordStore)
);

export default changePasswordStore;
