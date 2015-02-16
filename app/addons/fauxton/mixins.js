define([], function () {

  // A small mixin to reduce boilerplate code. This assumes the component has two properties:
  // `store` - contains the store
  // `onChange` - an onChange method that gets fired when
  var StoreListener = {
    componentDidMount: function () {
      this.store.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      this.store.off('change', this.onChange);
    }
  };

  return {
    StoreListener: StoreListener
  };

});
