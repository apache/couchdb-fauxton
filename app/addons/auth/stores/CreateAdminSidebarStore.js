import FauxtonAPI from "../../../core/api";
import ActionTypes from "../actiontypes";

const CreateAdminSidebarStore = FauxtonAPI.Store.extend({
  initialize() {
    this.reset();
  },
  reset() {
    this._selectedPage = "changePassword";
  },
  getSelectedPage() {
    return this._selectedPage;
  },
  setSelectedPage(val) {
    this._selectedPage = val;
  },
  dispatch(action) {
    switch (action.type) {
      case ActionTypes.AUTH_SELECT_PAGE:
        this.setSelectedPage(action.page);
        this.triggerChange();
        break;

      default:
        return;
    }
  }
});

const createAdminSidebarStore = new CreateAdminSidebarStore();
createAdminSidebarStore.dispatchToken = FauxtonAPI.dispatcher.register(
  createAdminSidebarStore.dispatch.bind(createAdminSidebarStore)
);

export default createAdminSidebarStore;
