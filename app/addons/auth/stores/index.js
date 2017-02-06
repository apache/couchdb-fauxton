// Not thrilled with this. The sole purpose of these next two stores is because the Create Admin + Change Password
// forms need to clear after a successful post. Since those events occur in actions.js, we need a way to tell the
// component to update + clear the fields. That's why all this code exists.

export changePasswordStore from './ChangePassword';
export createAdminStore from './CreateAdminStore';
export createAdminSidebarStore from './CreateAdminSidebarStore.js';
