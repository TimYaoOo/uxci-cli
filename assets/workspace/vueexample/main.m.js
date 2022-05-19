import App from './App.vue'
const render = (root, vue) => {
  vue.config.productionTip = false;

  new vue({
    render: h => h(App),
  }).$mount(document.querySelector(root) || '#mircoAppContainer');
}

const isbeehive = window.__POWERED_BY_BEEHIVE__;

if(!isbeehive) {
  render('',Vue);
}

export const bootstrap = (props) => {
  render(props.rootEl, props.libs.Vue, props.libs.Element)
}
