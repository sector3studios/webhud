import {
	classNames,
	prettyDebugInfo,
	currentFocusIsInput,
	INVALID
} from '../../lib/utils';
import { merge } from 'lodash-es';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import _, {
	dynamicTranslate as __,
	setLocale,
	Locales,
	getTranslations
} from './../../translate';
import Aids from '../aids/aids';
import CrewChief from '../crewChief/crewChief';
import Damage from '../damage/damage';
import Flags from '../flags/flags';
import Fuel from '../fuel/fuel';
import Gforce from '../gforce/gforce';
import Graphs from '../graphs/graphs';
import Info from '../info/info';
import Inputs from '../inputs/inputs';
import IShared from './../../types/r3eTypes';
import Motec from '../motec/motec';
import OvertakingAids from '../overtakingAids/overtakingAids';
import PitLimiter from '../pitLimiter/pitLimiter';
import Pitstop from '../pitstop/pitstop';
import PositionBar from '../positionBar/positionBar';
import Progress from '../progress/progress';
import r3e, { registerUpdate, unregisterUpdate } from './../../lib/r3e';
import React, { ChangeEvent } from 'react';
import Spotting from '../spotting/spotting';
import StartingLights from '../startingLights/startingLights';
import style from './app.scss';
import SvgIcon from '../svgIcon/svgIcon';
import Tires from '../tires/tires';

interface IProps {}

interface ISubSettings {
	[key: string]: {
		enabled: boolean;
		text(): string;
	};
}

export interface IWidgetSetting {
	id: string;
	enabled: boolean;
	zoom: number;
	position: {
		x: number;
		y: number;
	};
	subSettings: ISubSettings;
	name(): string;
}

@observer
export default class App extends React.Component<IProps> {
	appRef = React.createRef<HTMLDivElement>();

	loadTime = Date.now();

	// Deal with centering the main ui so it is always stays 16:9
	@observable
	aspectHeight: number | null = null;

	@observable
	hide = false;

	@observable
	showEditGrid = false;

	@observable
	language = localStorage.language || 'en';

	@observable
	settings: { [key: string]: IWidgetSetting } = {
		positionBar: {
			id: 'positionBar',
			enabled: true,
			zoom: 1,
			name: __('Position bar'),
			subSettings: {
				currentPosition: {
					text: __('Current position'),
					enabled: true
				},
				lapTime: {
					text: __('Lap time'),
					enabled: true
				},
				currentLap: {
					text: __('Current lap'),
					enabled: true
				},
				sessionTime: {
					text: __('Session time'),
					enabled: true
				}
			},
			position: {
				x: INVALID,
				y: INVALID
			}
		},
		progress: {
			id: 'progress',
			enabled: true,
			zoom: 1,
			name: __('Delta'),
			subSettings: {
				deltaText: {
					text: __('Delta text'),
					enabled: true
				},
				deltaBars: {
					text: __('Delta bars'),
					enabled: true
				},
				deltaNextPosition: {
					text: __('Next position'),
					enabled: true
				},
				estimatedLapTime: {
					text: __('Estimated lap time'),
					enabled: true
				},
				estimatedPosition: {
					text: __('Estimated position'),
					enabled: true
				},
				hideInRace: {
					text: __('Hide in race'),
					enabled: false
				}
			},
			position: {
				x: INVALID,
				y: INVALID
			}
		},
		motec: {
			id: 'motec',
			enabled: true,
			zoom: 1,
			name: __('Motec'),
			subSettings: {},
			position: {
				x: INVALID,
				y: INVALID
			}
		},
		positionBarRelative: {
			id: 'positionBarRelative',
			enabled: true,
			zoom: 1,
			name: __('Relative'),
			subSettings: {},
			position: {
				x: INVALID,
				y: INVALID
			}
		},
		spotting: {
			id: 'spotting',
			enabled: true,
			zoom: 1,
			name: __('Spotting'),
			subSettings: {
				shouldBeep: {
					text: __('Should beep'),
					enabled: true
				}
			},
			position: {
				x: INVALID,
				y: INVALID
			}
		},
		inputs: {
			id: 'inputs',
			enabled: true,
			zoom: 1,
			name: __('Inputs'),
			subSettings: {
				steeringInput: {
					text: __('Steering wheel'),
					enabled: true
				}
			},
			position: {
				x: INVALID,
				y: INVALID
			}
		},
		gforce: {
			id: 'gforce',
			enabled: true,
			zoom: 1,
			name: __('G-Force'),
			subSettings: {},
			position: {
				x: INVALID,
				y: INVALID
			}
		},
		aids: {
			id: 'aids',
			enabled: true,
			zoom: 1,
			name: __('Car assists'),
			subSettings: {},
			position: {
				x: INVALID,
				y: INVALID
			}
		},
		pitstop: {
			id: 'pitstop',
			enabled: false,
			zoom: 1,
			name: __('Pitstop'),
			subSettings: {},
			position: {
				x: INVALID,
				y: INVALID
			}
		},
		startingLights: {
			id: 'startingLights',
			enabled: true,
			zoom: 1,
			name: __('Race start lights'),
			subSettings: {},
			position: {
				x: INVALID,
				y: INVALID
			}
		},
		graphs: {
			id: 'graphs',
			enabled: true,
			zoom: 1,
			name: __('Telemetry'),
			subSettings: {},
			position: {
				x: INVALID,
				y: INVALID
			}
		},
		flags: {
			id: 'flags',
			enabled: false,
			zoom: 1,
			name: __('Flags'),
			subSettings: {},
			position: {
				x: INVALID,
				y: INVALID
			}
		},
		crewChief: {
			id: 'crewChief',
			enabled: true,
			zoom: 1,
			name: __('Crew chief'),
			subSettings: {},
			position: {
				x: INVALID,
				y: INVALID
			}
		},
		pitLimiter: {
			id: 'pitLimiter',
			enabled: false,
			zoom: 1,
			name: __('Pit limiter'),
			subSettings: {},
			position: {
				x: INVALID,
				y: INVALID
			}
		},
		info: {
			id: 'info',
			enabled: false,
			zoom: 1,
			name: __('Race info'),
			subSettings: {},
			position: {
				x: INVALID,
				y: INVALID
			}
		},
		overtakingAids: {
			id: 'overtakingAids',
			enabled: true,
			zoom: 1,
			name: __('P2P/DRS'),
			subSettings: {},
			position: {
				x: INVALID,
				y: INVALID
			}
		},
		damage: {
			id: 'damage',
			enabled: true,
			zoom: 1,
			name: __('Damage'),
			subSettings: {},
			position: {
				x: INVALID,
				y: INVALID
			}
		},
		tires: {
			id: 'tires',
			enabled: true,
			zoom: 1,
			name: __('Tires'),
			subSettings: {},
			position: {
				x: INVALID,
				y: INVALID
			}
		},
		fuel: {
			id: 'fuel',
			enabled: true,
			zoom: 1,
			name: __('Fuel'),
			subSettings: {},
			position: {
				x: INVALID,
				y: INVALID
			}
		}
	};

	@observable
	settingsOpacity = 0;

	@observable
	showSettings = false;

	@observable
	debugFilter = '';

	@observable
	appZoom = 1;

	@observable
	debugData: IShared | null = null;

	currentCursorWidgetOffset: null | {
		x: number;
		y: number;
		id: string;
	} = null;

	updateFunction: Function | null = null;

	constructor(props: IProps) {
		super(props);

		// If version isn't defined we aren't in game
		if (!window.version) {
			(document.body.parentNode as any)!.classList.add('debug');
		}

		this.handleResize();
		this.recoverSettings();

		setLocale(this.language);

		// Deal with errors by clearing app settings, hopefully it solves the issue...
		window.onerror = () => {
			delete localStorage.appSettings;

			setTimeout(() => {
				window.location.reload(true);
			}, 3000);
		};
	}

	componentDidMount() {
		window.addEventListener('keypress', this.onKeyPress);
		window.addEventListener('mousemove', this.onMouseMove);
		window.addEventListener('mouseup', this.onMouseUp);
		window.addEventListener('resize', this.handleResize);
	}

	componentWillUnmount() {
		window.removeEventListener('keypress', this.onKeyPress);
		window.removeEventListener('mousemove', this.onMouseMove);
		window.removeEventListener('mouseup', this.onMouseUp);
		window.removeEventListener('resize', this.handleResize);
	}

	private onKeyPress = (e: KeyboardEvent) => {
		if (currentFocusIsInput()) {
			return;
		}

		if (e.key === 'I' && e.shiftKey) {
			if (this.updateFunction) {
				unregisterUpdate(this.updateFunction);
				this.updateFunction = null;
				this.setData(true);
			} else {
				this.updateFunction = this.setData.bind(this);
				registerUpdate(this.updateFunction);
			}
		}
	};

	private getPositionRelative = (x: number, y: number) => {
		if (!this.appRef.current) {
			return {
				x: 0,
				y: 0
			};
		}
		const offset = this.appRef.current.getBoundingClientRect();
		return {
			x: (x - offset.left * this.appZoom) / this.appZoom,
			y: (y - offset.top * this.appZoom) / this.appZoom
		};
	};
	@action
	private onMouseDown = (e: React.MouseEvent) => {
		const widgetId = this.getWidgetId(e);
		if (!widgetId) {
			return;
		}
		this.showEditGrid = true;

		const widgetEl = e.currentTarget as HTMLDivElement;
		const widgetOffset = widgetEl.getBoundingClientRect();

		const cursorPosition = this.getPositionRelative(e.clientX, e.clientY);

		// Need to scale these with zoom to get proper values
		const correctedOffset = this.getPositionRelative(
			widgetOffset.left * this.appZoom,
			widgetOffset.top * this.appZoom
		);

		this.currentCursorWidgetOffset = {
			id: widgetId,
			x: correctedOffset.x - cursorPosition.x,
			y: correctedOffset.y - cursorPosition.y
		};
	};

	@action
	private onWheel = (e: React.WheelEvent) => {
		const widgetId = this.getWidgetId(e);
		if (!widgetId) {
			return;
		}

		const diff = e.deltaY < 0 ? 0.1 : -0.1;

		this.settings[widgetId].zoom = this.settings[widgetId].zoom + diff;

		this.settings[widgetId].zoom = Math.max(
			0.1,
			Math.min(3, this.settings[widgetId].zoom)
		);
		this.saveSettings();
	};

	@action
	private onMouseUp = () => {
		this.currentCursorWidgetOffset = null;
		this.showEditGrid = false;
	};

	private saveSettings() {
		localStorage.appSettings = JSON.stringify(this.settings, null, '  ');
	}

	@action
	private recoverSettings = () => {
		if (localStorage.appSettings) {
			const savedSettings = JSON.parse(localStorage.appSettings);
			this.settings = merge(this.settings, savedSettings);
		}
	};

	@action
	private setData = (clear = false) => {
		this.debugData = !clear ? r3e.data : null;
	};

	@action
	private onMouseMove = (e: MouseEvent) => {
		const x1 = e.clientX;
		const x2 = 0;

		const diff = Math.max(0, 1 - Math.pow((x1 - x2) / 600, 7));
		this.settingsOpacity = diff;

		const cursorOffset = this.currentCursorWidgetOffset;
		if (!cursorOffset || !cursorOffset.id) {
			return;
		}

		const widgetId = cursorOffset.id;
		const widgetSettings = this.settings[widgetId];

		const cursorPosition = this.getPositionRelative(e.clientX, e.clientY);

		// Apply offset so widgets don't move relative to cursor start
		widgetSettings.position.x = cursorPosition.x + cursorOffset.x;
		widgetSettings.position.y = cursorPosition.y + cursorOffset.y;

		// Snap to 10px grid
		widgetSettings.position.x -= widgetSettings.position.x % 10;
		widgetSettings.position.y -= widgetSettings.position.y % 10;

		this.saveSettings();
	};

	@action
	private toggleWidget = (e: ChangeEvent<HTMLInputElement>) => {
		const name = e.target.getAttribute('data-name');
		if (!name) {
			return;
		}
		this.settings[name].enabled = !this.settings[name].enabled;

		this.saveSettings();
	};

	@action
	private zoomWidget = (e: ChangeEvent<HTMLInputElement>) => {
		const name = e.target.getAttribute('data-name');
		if (!name) {
			return;
		}
		this.settings[name].zoom = parseFloat(e.target.value);

		this.saveSettings();
	};

	@action
	private toggleSubWidget = (e: ChangeEvent) => {
		const name = e.target.getAttribute('data-name');
		const subName = e.target.getAttribute('data-sub-name');
		if (!name || !subName) {
			return;
		}
		const subSettings = this.settings[name].subSettings;
		if (!subSettings) {
			return;
		}
		subSettings[subName].enabled = !subSettings[subName].enabled;

		this.saveSettings();
	};

	@action
	private resetSettings = () => {
		Object.keys(this.settings).forEach((key) => {
			const setting = this.settings[key];
			setting.position.x = INVALID;
			setting.position.y = INVALID;
			setting.zoom = 1;
			setting.enabled = true;
		});
		delete localStorage.appSettings;
	};

	@action
	private handleResize = () => {
		const widthRatio = window.innerWidth / 1920;
		const heightRatio = window.innerHeight / 1080;
		const ratio = Math.min(widthRatio, heightRatio);
		this.appZoom = ratio;
	};

	@action
	private updateDebugFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.debugFilter = e.target.value;
	};

	@action
	private clearDebugFilter = () => {
		this.debugFilter = '';
	};

	@action
	private toggleSettings = () => {
		this.showSettings = !this.showSettings;
	};

	@action
	private toggleHide = () => {
		this.hide = !this.hide;
	};

	@action
	private setLocale = (lang: Locales) => {
		setLocale(lang);
		this.language = lang;
		localStorage.language = lang;
	};

	private getWidgetId(e: React.MouseEvent | React.WheelEvent) {
		return (e.currentTarget as HTMLDivElement).getAttribute('data-id');
	}

	render() {
		const versionMisMatch =
			r3e.data !== undefined &&
			(r3e.data.VersionMinor !==
				process.env.SHARED_MEMORY_VERSION_MINOR ||
				r3e.data.VersionMajor !==
					process.env.SHARED_MEMORY_VERSION_MAJOR);
		if (r3e.data === undefined || versionMisMatch) {
			setTimeout(() => {
				this.forceUpdate();
			}, 100);

			if (Date.now() - this.loadTime < 2000) {
				return null;
			}

			return (
				<div className="help">
					{versionMisMatch && (
						<div className="versionMismatch">
							{_('Version mismatch')}!
						</div>
					)}
					{_('Download')} <a href="dash.zip">{_('dash.zip')}</a>{' '}
					{_('and run it')}
					<br />
					{_(
						'-webHudUrl=https://sector3studios.github.io/webhud/dist/'
					)}
				</div>
			);
		}

		if (
			!window.location.toString().match(/debug/) &&
			r3e.data.GameInMenus
		) {
			setTimeout(() => {
				this.forceUpdate();
			}, 100);
			return <div className="help">{_('Game paused')}</div>;
		}

		// Disable in replay
		if (r3e.data.GameInReplay) {
			setTimeout(() => {
				this.forceUpdate();
			}, 1000);
			return null;
		}

		return (
			<div
				className="viewport"
				style={{
					zoom: this.appZoom
				}}
			>
				<main
					ref={this.appRef}
					className={classNames(style.app, {
						hide: this.hide
					})}
				>
					{this.getWidgets()}

					{this.showSettings && this.getAppSettings()}

					<div
						style={{
							opacity: this.settingsOpacity
						}}
						className="toggleSettings"
						onClick={this.toggleSettings}
					>
						<SvgIcon src={require('./../../img/icons/cog.svg')} />
					</div>
					<div
						style={{
							opacity: this.settingsOpacity
						}}
						className="toggleVisibility"
						onClick={this.toggleHide}
					>
						<SvgIcon src={require('./../../img/icons/eye.svg')} />
					</div>
				</main>
				{this.debugData && this.getDebug()}
				{this.showEditGrid && <div className="editGrid" />}
			</div>
		);
	}

	private getDebug() {
		return (
			<div
				className={classNames('debug', {
					hide: this.hide
				})}
			>
				<input
					value={this.debugFilter}
					onChange={this.updateDebugFilter}
					// tslint:disable-next-line:max-line-length
					placeholder={_('Type to filter keys')}
				/>
				<div className="clear" onClick={this.clearDebugFilter}>
					{_('X')}
				</div>
				<pre className="debugInfo">
					{prettyDebugInfo(this.debugData!, this.debugFilter)}
				</pre>
			</div>
		);
	}

	private getWidgets() {
		return (
			<div className="widgets">
				{this.settings.positionBar.enabled && (
					<PositionBar
						settings={this.settings.positionBar}
						onMouseDown={this.onMouseDown}
						onWheel={this.onWheel}
						relative={false}
					/>
				)}
				{this.settings.positionBarRelative.enabled && (
					<PositionBar
						settings={this.settings.positionBarRelative}
						onMouseDown={this.onMouseDown}
						onWheel={this.onWheel}
						relative={true}
					/>
				)}
				{this.settings.motec.enabled && (
					<Motec
						settings={this.settings.motec}
						onMouseDown={this.onMouseDown}
						onWheel={this.onWheel}
					/>
				)}
				{this.settings.progress.enabled && (
					<Progress
						settings={this.settings.progress}
						onMouseDown={this.onMouseDown}
						onWheel={this.onWheel}
					/>
				)}
				{this.settings.spotting.enabled && (
					<Spotting
						onMouseDown={this.onMouseDown}
						onWheel={this.onWheel}
						settings={this.settings.spotting}
					/>
				)}
				{this.settings.gforce.enabled && (
					<Gforce
						onMouseDown={this.onMouseDown}
						onWheel={this.onWheel}
						settings={this.settings.gforce}
					/>
				)}
				{this.settings.aids.enabled && (
					<Aids
						onMouseDown={this.onMouseDown}
						onWheel={this.onWheel}
						settings={this.settings.aids}
					/>
				)}
				{this.settings.pitstop.enabled && (
					<Pitstop
						onMouseDown={this.onMouseDown}
						onWheel={this.onWheel}
						settings={this.settings.pitstop}
					/>
				)}
				{this.settings.startingLights.enabled && (
					<StartingLights
						onMouseDown={this.onMouseDown}
						onWheel={this.onWheel}
						settings={this.settings.startingLights}
					/>
				)}
				{this.settings.flags.enabled && (
					<Flags
						onMouseDown={this.onMouseDown}
						onWheel={this.onWheel}
						settings={this.settings.flags}
					/>
				)}
				{this.settings.crewChief.enabled && (
					<CrewChief
						onMouseDown={this.onMouseDown}
						onWheel={this.onWheel}
						settings={this.settings.crewChief}
					/>
				)}
				{this.settings.overtakingAids.enabled && (
					<OvertakingAids
						onMouseDown={this.onMouseDown}
						onWheel={this.onWheel}
						settings={this.settings.overtakingAids}
					/>
				)}
				{this.settings.damage.enabled && (
					<Damage
						onMouseDown={this.onMouseDown}
						onWheel={this.onWheel}
						settings={this.settings.damage}
					/>
				)}
				{this.settings.tires.enabled && (
					<Tires
						onMouseDown={this.onMouseDown}
						onWheel={this.onWheel}
						settings={this.settings.tires}
					/>
				)}
				{this.settings.inputs.enabled && (
					<Inputs
						onMouseDown={this.onMouseDown}
						onWheel={this.onWheel}
						settings={this.settings.inputs}
					/>
				)}
				{this.settings.fuel.enabled && (
					<Fuel
						onMouseDown={this.onMouseDown}
						onWheel={this.onWheel}
						settings={this.settings.fuel}
					/>
				)}
				{this.settings.pitLimiter.enabled && <PitLimiter />}
				{this.settings.info.enabled && <Info />}
				{this.settings.graphs.enabled && (
					<Graphs opacity={this.settingsOpacity} />
				)}
			</div>
		);
	}

	private getAppSettings() {
		return (
			<div className="settings">
				{Object.keys(this.settings).map((widgetId) => {
					const subSettings = this.settings[widgetId].subSettings;
					return this.getWidgetSetting(widgetId, subSettings);
				})}

				<div className="languages">
					{Object.keys(getTranslations()).map((langKey) => {
						const languageLookup = {
							de: _('German'),
							en: _('English'),
							fr: _('French'),
							cn: _('Chinese')
						};
						return (
							<div
								key={langKey}
								className={classNames('language', {
									active: langKey === this.language
								})}
								onClick={() => {
									this.setLocale(langKey as Locales);
								}}
							>
								{languageLookup[langKey]}
							</div>
						);
					})}
				</div>
				<button className="button" onClick={this.resetSettings}>
					{_('Reset settings')}
				</button>
				<button className="button" onClick={this.toggleSettings}>
					{_('Close')}
				</button>
			</div>
		);
	}

	private getWidgetSetting(widgetId: string, subSettings: ISubSettings) {
		return (
			<div key={widgetId} className="widget">
				<label className="main">
					<span className="text">
						{this.settings[widgetId].name()}
					</span>
					<input
						type="checkbox"
						checked={this.settings[widgetId].enabled}
						data-name={widgetId}
						onChange={this.toggleWidget}
					/>
					<input
						type="range"
						min="0.2"
						max="2"
						step="0.1"
						value={this.settings[widgetId].zoom}
						data-name={widgetId}
						onChange={this.zoomWidget}
					/>
				</label>
				{subSettings &&
					Object.keys(subSettings).map((subId) => {
						return (
							<div key={subId} className="subWidget">
								<label className="sub">
									<input
										type="checkbox"
										checked={subSettings[subId].enabled}
										data-name={widgetId}
										data-sub-name={subId}
										onChange={this.toggleSubWidget}
									/>
									{_(subSettings[subId].text())}
								</label>
							</div>
						);
					})}
			</div>
		);
	}
}
