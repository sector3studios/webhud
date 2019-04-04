import { configure as mobxConfigure } from 'mobx';
import { isDev, setupGoogleAnalytics, setupSentry } from './lib/utils';
import App from './components/app/app';
import quickDebugCssReload from './lib/quickDebugCssReload';
import React from 'react';
import ReactDOM from 'react-dom';

mobxConfigure({
	enforceActions: 'observed'
});

setupGoogleAnalytics();

setupSentry();

quickDebugCssReload();

const rootName = 'dash';
const rootEl =
	document.getElementById(rootName) || document.createElement('div');
rootEl.id = rootName;
document.body.appendChild(rootEl);

ReactDOM.render(<App />, rootEl);

if (isDev && module.hot) {
	module.hot.accept();
}
