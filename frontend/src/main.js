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

async function loadServerConfigAndLanguage() {
  const data = await api.getServerConfig();
  const lang = await api.getLang(data.lang);
  return { data, lang };
}

async function initConfig() {
  try {
    const { data, lang } = await loadServerConfigAndLanguage();

    i18n.locale = data.lang;
    i18n.setLocaleMessage(i18n.locale, lang);

    Vue.prototype.$utils = new Utils(i18n);
    Vue.prototype.$api = api;

    const to = router.history.current;
    const t = to.meta.title ? `${i18n.tc(to.meta.title, 0)} /` : 'Dashboard';
    document.title = `${t} RHU`;

    api.getSettings();

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
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
}

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
    document.title = `${t} RHU`;
  });
});

initConfig();
