
function getDatabaseLabel (db) {
  let dbString = (_.isString(db)) ? db.trim().replace(/\/$/, '') : db.url;
  const matches = dbString.match(/[^\/]+$/, '');
  return matches[0];
}

function getReactSelectOptions (list) {
  return _.map(list, (item) => {
    return { value: item, label: item };
  });
}

export default {
  getDatabaseLabel,
  getReactSelectOptions
};
