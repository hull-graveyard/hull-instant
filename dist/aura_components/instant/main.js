Hull.component({

  templates: [
    'intro',
    'working',
    'won',
    'form',
    'lost',
    'played',
    'unstarted',
    'ended',
    'footer'
  ],

  events: {
    'submit form': function(e) {
      e.preventDefault();
      var formData = this.sandbox.dom.getFormData(e.target);
      this.instant.submitForm(formData);
    }
  },

  actions: {
    resetBadge: function() {
      this.instant.resetBadge();
    },
    play: function() {
      if (this.loggedIn()) {
        this.instant.play();
      } else {
        this.instant.loginAndPlay('facebook');
      }
    }
  },

  getTemplate: function() {
    var tpl = this.state.currentSection;
    console.warn("Template: ", tpl, this.state);
    return tpl;
  },

  initialize: function() {
    var self = this;
    this.instant = new InstantWin(Hull.currentUser(), this.api.model('app').toJSON());
    this.state = this.instant.getState();
    this.instant.onChange(function(state) {
      console.warn("----------------------> STATE CHANGE", state);
      self.state = state;
      console.warn("-------------> Rendering section: ", state.currentSection);
      self.render(state.currentSection, { state: state });
    });
  },

  beforeRender: function(data) {
    console.warn("Satte: ", this.state);
    this.authProviders = this.authServices();
    data.authProviders = this.authProviders;
    data.state = this.state;
  }


});
