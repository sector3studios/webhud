export const isDev = process.env.NODE_ENV !== 'production';
import * as Sentry from '@sentry/browser';
import { isObject } from 'lodash-es';
import IShared from './../types/r3eTypes';
import isPlainObject from 'lodash-es/isPlainObject';
import r3e from './r3e';
import speedDate from 'speed-date';

export const updateRate = 1000 / 30;

export function playSound(path: string, volume?: number) {
	const sound = new Audio(path);
	sound.volume = volume || 1;
	sound.addEventListener('canplaythrough', () => {
		sound.play().catch((e) => {
			console.log(e);
		});
	});
	sound.addEventListener('error', (e) => {
		console.error(`Failed to play: ${path}, because: ${e}`);
	});

	return sound;
}

export function classNames(...names: (string | number | object | undefined)[]) {
	let classes: string[] = [];

	for (const arg of names) {
		if (!arg) {
			continue;
		}

		if (typeof arg === 'string' || typeof arg === 'number') {
			classes.push(arg.toString());
		} else if (Array.isArray(arg)) {
			classes = classes.concat(
				arg.map((className) => {
					return classNames(className);
				})
			);
		} else if (isPlainObject(arg)) {
			classes = classes.concat(
				Object.keys(arg).filter((key) => {
					return arg[key];
				})
			);
		} else {
			throw new Error('Passed unknown type into classNames');
		}
	}

	return classes.join(' ');
}

export function rpsToRpm(rps: number) {
	return rps * (60 / (Math.PI * 2));
}

export function mpsToKph(mps: number) {
	return mps * 3.6;
}

export function newtonToKg(newton: number) {
	return newton / 9.80665;
}

export function distance2d(x1: number, y1: number, x2: number, y2: number) {
	const a = x1 - x2;
	const b = y1 - y2;

	return Math.sqrt(a * a + b * b);
}

export function toDegrees(angle: number) {
	return angle * (180 / Math.PI);
}

// Required, otherwise we get `Aleksi KÃ¤rkkÃ¤inen` not `Aleksi Kärkkäinen`
function b64DecodeUnicode(str: string) {
	// If we don't replace we get `URI malformed`
	const decoded = atob(str).replace(/ÿ/g, '');
	return decodeURIComponent(
		decoded
			.split('')
			.map((c) => {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			})
			.join('')
	);
}
const decodeLookup = {};
export function base64ToString(str: string) {
	if (decodeLookup[str]) {
		return decodeLookup[str];
	}
	const decoded = b64DecodeUnicode(str).replace(/\u0000/g, '');
	decodeLookup[str] = decoded;
	return decoded;
}

const formatTimeReuseDate = new Date();
export function formatTime(
	seconds: number,
	format: string,
	addPlusPrefix = false
) {
	const prefix = seconds < 0 ? '-' : addPlusPrefix ? '+' : '';
	const ms = Math.abs(seconds * 1000);
	formatTimeReuseDate.setTime(ms);

	return prefix + speedDate.UTC.cached(format, formatTimeReuseDate);
}

export function widgetSettings(props: any) {
	return {
		'data-id': props.settings.id,
		onMouseDown: props.onMouseDown,
		onWheel: props.onWheel,
		style: {
			// Top left origin is required otherwise the drag/movement
			// of widgets will work incorrectly.
			transformOrigin: 'top left',
			transform: `scale(${props.settings.zoom})`,
			cursor: 'move',
			top:
				props.settings.position.y !== -1
					? props.settings.position.y
					: undefined,
			left:
				props.settings.position.x !== -1
					? props.settings.position.x
					: undefined
		}
	};
}

export function setupSentry() {
	const dsn = process.env.SENTRY_DSN;
	if (!dsn) {
		return;
	}

	const sentryOptions = {
		dsn: process.env.SENTRY_DSN,
		release: process.env.RELEASE,
		environment: process.env.NODE_ENV,
		blacklistUrls: [/extensions\//i, /^chrome:\/\//i],
		beforeSend: (event: Sentry.SentryEvent) => {
			const gameState = r3e.data;

			// Snapshot will be too big with driverData in it.
			delete gameState.DriverData;

			event.extra = {
				gameState
			};

			return event;
		}
	};

	Sentry.init(sentryOptions);
	Sentry.configureScope((scope) => {
		scope.setUser({ gameVersion: window.version || 'browser' });
	});
}

export function setupGoogleAnalytics() {
	const gaKey = process.env.ANALYTICS_KEY;
	if (!gaKey) {
		return;
	}

	window['GoogleAnalyticsObject'] = 'ga';
	window['ga'] =
		window['ga'] ||
		// tslint:disable-next-line:only-arrow-functions
		function() {
			(window['ga'].q = window['ga'].q || []).push(arguments);
		};
	window['ga'].l = Date.now();

	const scriptEl = document.createElement('script');
	const gaElems = document.getElementsByTagName('script')[0];
	scriptEl.async = true;
	scriptEl.src = '//www.google-analytics.com/analytics.js';
	if (gaElems.parentNode) {
		gaElems.parentNode.insertBefore(scriptEl, gaElems);
	}

	ga('create', gaKey, 'auto');
	ga('send', 'pageview');
}

export function lerpColor(a: string, b: string, amount: number) {
	const ah = parseInt(a.replace(/#/g, ''), 16);
	const ar = ah >> 16;
	const ag = (ah >> 8) & 0xff;
	const ab = ah & 0xff;
	const bh = parseInt(b.replace(/#/g, ''), 16);
	const br = bh >> 16;
	const bg = (bh >> 8) & 0xff;
	const bb = bh & 0xff;
	const rr = ar + amount * (br - ar);
	const rg = ag + amount * (bg - ag);
	const rb = ab + amount * (bb - ab);

	return (
		'#' +
		(((1 << 24) + (rr << 16) + (rg << 8) + rb) | 0).toString(16).slice(1)
	);
}

const filterBySearch = (search: RegExp, key: string, value: any): Boolean => {
	if (key.match(search)) {
		return true;
	}

	let containsKey = false;
	if (isObject(value)) {
		Object.keys(value).forEach((subKey) => {
			if (filterBySearch(search, subKey, value[subKey])) {
				containsKey = true;
			} else {
				// tslint:disable-next-line:no-dynamic-delete
				delete value[subKey];
			}
		});
	}

	return containsKey;
};

export function prettyDebugInfo(data: IShared, filter: string) {
	const copy = filter ? JSON.parse(JSON.stringify(data)) : data;
	if (filter) {
		const search = new RegExp(filter, 'i');
		filterBySearch(search, '', copy);
	}
	const json = JSON.stringify(copy, null, '  ');

	// Quick and dirty way of replacing the game string to readable format
	return json.replace(/"([a-z0-9]+==)"/gi, (_str, inner) => {
		return `"${base64ToString(inner)}"`;
	});
}

export function currentFocusIsInput() {
	const activeEl = document.activeElement;
	if (activeEl && activeEl.tagName.match(/^(INPUT|TEXTAREA)$/)) {
		return true;
	}

	return false;
}

export function lerp(v0: number, v1: number, alpha: number) {
	return v0 * (1 - alpha) + v1 * alpha;
}

export const INVALID = -1;

const classColorLookup = {};
export function getClassColor(performanceIndex: number) {
	if (performanceIndex === INVALID) {
		return '#000';
	}

	if (classColorLookup[performanceIndex]) {
		return classColorLookup[performanceIndex];
	}
	classColorLookup[performanceIndex] = '';

	const classCount = Object.keys(classColorLookup).length;

	const maxHslColorValue = 250;
	const step = maxHslColorValue / Math.max(1, classCount - 1);

	Object.keys(classColorLookup)
		.map(Number)
		.sort((a, b) => {
			return a - b;
		})
		.forEach((index, i) => {
			const offset = step * i;
			classColorLookup[index] = `hsl(${offset}, 100%, 60%)`;
		});

	return classColorLookup[performanceIndex];
}

export function qs(searchFor: string) {
	const query = window.location.search.substring(1);
	const parms = query.split('&');
	for (let i = 0; i < parms.length; i++) {
		const pos = parms[i].indexOf('=');
		if (pos > 0 && searchFor === parms[i].substring(0, pos)) {
			return parms[i].substring(pos + 1);
		}
	}
	return null;
}

export function showDebugMessage(msg: string) {
	const id = 'tmpMessage';
	const oldEl = document.getElementById(id);
	if (oldEl && oldEl.parentNode) {
		oldEl.parentNode.removeChild(oldEl);
	}

	const el = document.createElement('div');
	el.innerText = msg;
	el.id = id;

	el.style.color = '#fff';
	el.style.fontSize = '50px';
	el.style.position = 'fixed';
	el.style.top = '50%';
	el.style.left = '50%';
	el.style.background = 'rgba(0,0,0,0.6)';
	el.style.textShadow = '2px 2px 0 rgba(0,0,0,0.5)';
	el.style.padding = '0 30px';
	el.style.height = '100px';
	el.style.lineHeight = '100px';
	el.style.textAlign = 'center';
	el.style.borderRadius = '20px';
	el.style.transform = 'translate(-50%, -50%)';
	el.style.zIndex = '100';
	el.style.whiteSpace = 'nowrap';
	document.body.appendChild(el);
	el.classList.add('media-popup');

	setTimeout(() => {
		if (el.parentNode) {
			el.parentNode.removeChild(el);
		}
	}, 1000);
}
