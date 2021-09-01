import Vue from "vue";
import Router from "vue-router";
import Principal from "./views/Principal.vue";

Vue.use(Router);

export default new Router({
  // mode: "history",
  routes: [
    {
      path: "/",
      name: "principal",
      component: Principal
    },
    {
      path: "/admin",
      name: "admin",
      component: () =>
        import(/* webpackChunkName: "admin" */ "./views/Admin.vue")
    },
    {
      path: "/check-user-data",
      name: "check",
      component: () =>
        import(/* webpackChunkName: "admin" */ "./views/Check.vue")
    }
  ]
});
