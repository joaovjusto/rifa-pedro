import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    carregando: false
  },
  mutations: {
    SET_LOADING_STATUS(state, status) {
      state.carregando = status;
    }
  },
  getters: {
    carregando: state => state.carregando
  }
});
