import Vue from 'vue';
import Buefy from 'buefy';
import VueI18n from 'vue-i18n';

import App from './App.vue';
import router from './router';
import store from './store';
import * as api from './api';
import Utils from './utils';

Vue.use(VueI18n);
Vue.use(Buefy);

Vue.config.productionTip = false;

const i18n = new VueI18n();

async function initConfig() {
  // Load server-side config and language before mounting the app.
  const data = await api.getServerConfig();
  const lang = await api.getLang(data.lang);

  // Set up VueI18n with the loaded language data.
  i18n.locale = data.lang;
  i18n.setLocaleMessage(i18n.locale, lang);

  // Attach Utils and api to Vue instance prototype.
  Vue.prototype.$utils = new Utils(i18n);
  Vue.prototype.$api = api;

  // Set the page title after i18n has loaded.
  const to = router.history.current;
  const t = to.meta.title ? `${i18n.tc(to.meta.title, 0)} /` : '';
  document.title = `${t} listmonk`;

  // Fetch additional settings.
  api.getSettings();

  // Create and mount the Vue app.
  new Vue({
    router,
    store,
    i18n,
    render: (h) => h(App),
    mounted() {
      this.isLoaded = true;
    },
    data: {
      isLoaded: false,
    },
  }).$mount('#app');
}

// Global navigation guards.
router.beforeEach((to, from, next) => {
  if (to.matched.length === 0) {
    next('/404');
  } else {
    next();
  }
});

router.afterEach((to) => {
  Vue.nextTick(() => {
    const t = to.meta.title && i18n.te(to.meta.title) ? `${i18n.tc(to.meta.title, 0)} |` : 'Dashboard |';
    document.title = `${t} Rafik Hariri University`;
  });
});

// Initialize the app configuration.
initConfig();
