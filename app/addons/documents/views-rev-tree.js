define([
  "app",
  "api",
  "addons/documents/resources",
  "addons/documents/revisionTree/component.react"
],

function (app, FauxtonAPI, Resources, Components) {
  var Views = {};

  Views.Wrapper = FauxtonAPI.View.extend({
    className: 'list',

    afterRender: function () {
      Components.renderContent(this.el, this.params);
    }

  });

  Resources.WRAP = Views;

  return Resources;
});
