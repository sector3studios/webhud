import { isObject } from 'lodash-es';
import { updateRate, currentFocusIsInput, qs, showDebugMessage } from './utils';
import IShared from './../types/r3eTypes';
import ReconnectingWebSocket from './reconnecting-websocket';

interface ISharedData {
	data: IShared;
}

const updateQueue: Function[] = [];

export function registerUpdate(func: Function) {
	updateQueue.push(func);
}

export function unregisterUpdate(func: Function) {
	const index = updateQueue.indexOf(func);
	if (index === -1) {
		return;
	}
	updateQueue.splice(index, 1);
}

// Connect to local websocket server to recieve game data through shared memory
const container: ISharedData = {} as any;

const overrideAddress = qs('ws');
const address = overrideAddress ? overrideAddress : 'localhost:8070';
const ws = new ReconnectingWebSocket(`ws://${address}/r3e`);
const updateInterval = setInterval(() => {
	if (ws.readyState !== WebSocket.OPEN) {
		return;
	}

	// Each time we send the server a message it will respond with the data
	ws.send('');
}, updateRate);

function updateAllInQueue() {
	for (let i = 0; i < updateQueue.length; i += 1) {
		updateQueue[i]();
	}
}

ws.onmessage = (e) => {
	// Allow the ability to override data for development purposes
	if (debugData) {
		container.data = debugData;
		updateAllInQueue();
		return;
	}

	const data: IShared = JSON.parse(e.data);
	if (!data.DriverData) {
		return;
	}
	container.data = data;

	updateAllInQueue();
};

ws.onconnecting = () => {
	console.info('Connected.');
};

let debugData: any = null;
// Restore cached state incase we had to reload
if (localStorage.stateJson) {
	try {
		debugData = JSON.parse(localStorage.stateJson);
		if (!isObject(debugData)) {
			debugData = null;
		}
	} catch (e) {
		delete localStorage.stateJson;
	}
	showDebugMessage('Restored UI');
}

function setDebugData(stateJson: string) {
	try {
		debugData = JSON.parse(stateJson);
		if (!isObject(debugData)) {
			return;
		}
		localStorage.stateJson = stateJson;
	} catch (e) {}
}

// By pasting in json we will use that as the base for the UI.
// Handy for debugging
// Resume updates by pressing Shift+Space
const handlePaste = (event: ClipboardEvent) => {
	const clipText = event.clipboardData.getData('Text');
	try {
		setDebugData(clipText);
		showDebugMessage('Loaded game state from clip board');
	} catch (e) {
		console.error(e);
	}
};
document.addEventListener('paste', handlePaste);

const handleDebug = (e: KeyboardEvent) => {
	if (currentFocusIsInput() || !e.shiftKey) {
		return;
	}

	// Press Shift+D to dump the current state into clipboard
	// Useful for saving edge-cases/bug reports
	if (e.key === 'd') {
		const json = JSON.stringify(container.data || {});

		const copyFrom = document.createElement('textarea');
		copyFrom.value = json;
		copyFrom.style.opacity = '0';
		document.body.appendChild(copyFrom);
		copyFrom.select();
		document.execCommand('copy');
		document.body.removeChild(copyFrom);
		showDebugMessage('Saved game state to clip board as JSON');
	}

	// Press Shift+Space to pause the updates of UI data
	if (e.which === 32) {
		if (debugData) {
			showDebugMessage('Unpause UI');
			delete localStorage.stateJson;
			debugData = null;
			return;
		}
		const stateJson = JSON.stringify(container.data || {});
		setDebugData(stateJson);
		showDebugMessage('Pause UI');
	}
};

window.addEventListener('keyup', handleDebug);

if (module.hot) {
	module.hot.dispose(() => {
		clearInterval(updateInterval);
		document.removeEventListener('paste', handlePaste);
		window.removeEventListener('keyup', handleDebug);
	});
}

export default container;
