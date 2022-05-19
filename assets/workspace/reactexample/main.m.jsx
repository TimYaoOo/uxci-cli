import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App';
import 'antd-css';
// console.log(antd)
const render = (root) => {
  if(root) {
    root = root.replace('#', '');
  }
    ReactDOM.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
        root ? document.getElementById(root) : document.getElementById('mircoAppContainer')
    )
}
const isbeehive = window.__POWERED_BY_BEEHIVE__;
if(!isbeehive) {
  render();
}
export const bootstrap = (props) => {
  render(props.rootEl)
}

