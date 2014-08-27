// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.


// This file creates a set of helper functions that will be loaded for all html
// templates. These functions should be self contained and not rely on any
// external dependencies as they are loaded prior to the application. We may
// want to change this later, but for now this should be thought of as a
// "purely functional" helper system.

define([
  "api"
],

function(FauxtonAPI) {

  var Resize = function(options){
    this.options = options;
  };

  Resize.prototype = {

    initialize: function(){
      //add throttler :)
      this.lazyLayout = _.debounce(this.onResizeHandler, 300).bind(this);
      FauxtonAPI.utils.addWindowResize(this.lazyLayout,"animation");
      FauxtonAPI.utils.initWindowResize();
      this.onResizeHandler();
    },

    onResizeHandler: function (){
      var fullWidth = this.getFullWidth(),
          halfWidth = this.getHalfWidth(),
          sidebarWidth = this.getSidebarContentWidth(),
          left = $('.window-resizeable-half').length > 0? halfWidth : sidebarWidth;

      $('.window-resizeable').innerWidth(sidebarWidth);
      $('.window-resizeable-half').innerWidth(halfWidth);
      $('.window-resizeable-full').innerWidth(fullWidth);

      //set left
      this.setLeftPosition(left);
      //if there is a callback, run that
      this.options.callback && this.options.callback();
      this.trigger('resize');
    },

    cleanupCallback: function(){
      this.callback = null;
    },

    getPrimaryNavWidth: function(){
      var primaryNavWidth  = $('body').hasClass('closeMenu') ? 64 : $('#primary-navbar').outerWidth();
      //$('body').hasClass('closeMenu') ? 64 : 220;
      return primaryNavWidth;
    },

    getWindowWidth: function(){
      return window.innerWidth;
    },

    getFullWidth: function(){
      return this.getWindowWidth() - this.getPrimaryNavWidth();
    },

    getSidebarWidth: function(){
      return $('#breadcrumbs').length > 0 ? $('#breadcrumbs').outerWidth() : 0;
    },

    getSidebarContentWidth: function(){
      return this.getFullWidth() - this.getSidebarWidth() -5;
    },

    getHalfWidth: function(){
      var fullWidth = this.getFullWidth();
      return fullWidth/2;
    },

    setLeftPosition: function(panelWidth){
      var primary = this.getPrimaryNavWidth();
      $('.set-left-position').css('left',panelWidth+primary+4);
    }
  };

  _.extend(Resize.prototype, Backbone.Events);

  return Resize;
});


