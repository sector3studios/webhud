import {
	classNames,
	base64ToString,
	formatTime,
	widgetSettings,
	INVALID,
	getClassColor
} from './../../lib/utils';
import {
	ESession,
	IDriverData,
	EPitState,
	ESessionPhase
} from './../../types/r3eTypes';
import { action, observable } from 'mobx';
import { IWidgetSetting } from '../app/app';
import { observer } from 'mobx-react';
import { times, uniq } from 'lodash-es';
import _ from './../../translate';
import r3e, { registerUpdate, unregisterUpdate } from './../../lib/r3e';
import React from 'react';
import style from './positionBar.scss';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
	relative: boolean;
	settings: IWidgetSetting;
}
interface IDriverInfo {
	isUser: boolean;
	id: number;
	name: string;
	position: number;
	meta: IDriverData;
	diff: string | number;
	lapDiff: number;
	classColor: string;
}
@observer
export default class PositionBar extends React.Component<IProps, {}> {
	@observable
	drivers: IDriverInfo[] = [];

	@observable
	currentLap = INVALID;

	@observable
	maxLaps = INVALID;

	@observable
	pitState = INVALID;

	@observable
	sessionPhase = INVALID;

	@observable
	sessionTimeRemaining = INVALID;

	@observable
	classDriverCount = INVALID;

	@observable
	position = INVALID;

	@observable
	sessionType = INVALID;

	@observable
	lapTimeCurrentSelf = INVALID;

	@observable
	playerCount = INVALID;

	playerPosition = INVALID;

	positionBarCount = 15;

	entryWidth = 148;

	userDriverData: IDriverInfo | null = null;

	classColorUpdate: number;

	constructor(props: IProps) {
		super(props);

		registerUpdate(this.update);

		this.forceClassColorUpdate();
		this.classColorUpdate = setInterval(
			this.forceClassColorUpdate,
			10 * 1000
		);
	}
	componentWillUnmount() {
		clearInterval(this.classColorUpdate);
		unregisterUpdate(this.update);
	}

	private sortByLapDistance = (a: IDriverInfo, b: IDriverInfo) => {
		return b.meta.LapDistance - a.meta.LapDistance;
	};

	@action
	private update = () => {
		this.pitState = r3e.data.PitState;
		this.classDriverCount = 0;
		this.playerCount = r3e.data.DriverData.length;

		let driverData = r3e.data.DriverData.map(this.formatDriverData).filter(
			this.filterDriverData
		);

		// Deal with filtering and ordering relative positions
		if (this.props.relative) {
			driverData = driverData.sort(this.sortByLapDistance);

			const playerPosition = this.getPlayerPosition(driverData);

			// Start based on user with offset so it can wrap around
			const start = Math.max(playerPosition, 0) + driverData.length;

			// Make sure these are unique otherwise it will "loop" with few opponents
			driverData = uniq(
				driverData
					.concat(driverData, driverData)
					.slice(
						Math.max(0, start - 3),
						Math.min(driverData.length * 3, start + 4)
					)
			);
		}

		this.calculateDiffs(driverData);

		if (!this.props.relative) {
			const playerPosition = this.getPlayerPosition(driverData);

			driverData = driverData.slice(
				Math.max(playerPosition - 6, 0),
				playerPosition + 7
			);
		}

		this.getPlayerPosition(driverData);
		this.drivers = driverData.map((driver) => {
			delete driver.meta;
			return driver;
		});

		this.sessionPhase = r3e.data.SessionPhase;
		this.currentLap = r3e.data.CompletedLaps + 1;
		this.maxLaps = r3e.data.NumberOfLaps;
		this.sessionTimeRemaining = r3e.data.SessionTimeRemaining;

		this.position = r3e.data.PositionClass;
		this.sessionType = r3e.data.SessionType;
		this.lapTimeCurrentSelf = r3e.data.LapTimeCurrentSelf;
	};

	private getPlayerPosition = (driverData: IDriverInfo[]) => {
		let userPosition = 0;
		for (let i = 0; i < driverData.length; i++) {
			if (driverData[i].id === r3e.data.VehicleInfo.SlotId) {
				userPosition = i;
			}
		}

		return userPosition;
	};

	private filterDriverData = (driver: IDriverInfo) => {
		const isRaceSession = r3e.data.SessionType === ESession.Race;
		if (
			!isRaceSession &&
			driver.meta.SectorTimeBestSelf.Sector3 === INVALID &&
			!driver.isUser
		) {
			return false;
		}

		return true;
	};

	private formatDriverData = (driver: IDriverData): IDriverInfo => {
		const isUser =
			r3e.data!.VehicleInfo.SlotId === driver.DriverInfo.SlotId;
		if (
			driver.DriverInfo.ClassPerformanceIndex ===
			r3e.data.VehicleInfo.ClassPerformanceIndex
		) {
			this.classDriverCount += 1;
		}

		const driverData = {
			isUser,
			id: driver.DriverInfo.SlotId,
			name: base64ToString(driver.DriverInfo.Name),
			position: driver.PlaceClass,
			meta: driver,
			lapDiff: driver.CompletedLaps - r3e.data.CompletedLaps,
			diff: isUser ? this.getPlayerPositionText() : '',
			classColor: getClassColor(driver.DriverInfo.ClassPerformanceIndex)
		};
		this.userDriverData = driverData;
		return driverData;
	};

	private forceClassColorUpdate() {
		r3e.data.DriverData.forEach((driver) => {
			getClassColor(driver.DriverInfo.ClassPerformanceIndex);
		});
	}

	private calculateDiffs(drivers: IDriverInfo[]) {
		const isRace = r3e.data.SessionType === ESession.Race;

		if (isRace) {
			if (this.props.relative) {
				this.calculateDiffsRaceRelative(drivers);
			} else {
				this.calculateDiffsRace(drivers);
			}
		} else {
			this.calculateDiffsQualify(drivers);
		}
	}

	private calculateDiffsQualify(drivers: IDriverInfo[]) {
		const userBestSector =
			r3e.data.SectorTimesBestSelf.Sector3 !== INVALID
				? r3e.data.SectorTimesBestSelf.Sector3
				: 0;

		drivers.forEach((driver, i) => {
			if (driver.isUser) {
				this.playerPosition = i + 1;
				return;
			}
			const diff =
				driver.meta.SectorTimeBestSelf.Sector3 - userBestSector;
			driver.diff =
				diff > 60
					? formatTime(diff, 'm:ss.SSS', true)
					: formatTime(diff, 's.SSS', true);
		});
	}

	private calculateDiffsRace(drivers: IDriverInfo[]) {
		const driversInfront = drivers.slice(0, r3e.data.Position - 1);
		let infrontDiff = 0;
		driversInfront.reverse().forEach((driver) => {
			infrontDiff += driver.meta.TimeDeltaBehind;
			if (infrontDiff < 120) {
				driver.diff =
					infrontDiff > 60
						? formatTime(infrontDiff * -1, 'm:ss.SSS')
						: formatTime(infrontDiff * -1, 's.SSS');
			} else {
				driver.diff =
					Math.abs(driver.lapDiff) > 1
						? (driver.diff = `-${Math.abs(driver.lapDiff)} ${_(
								'laps'
						  )}`)
						: (driver.diff = `-${Math.abs(driver.lapDiff)} ${_(
								'lap'
						  )}`);
			}
		});

		const driversAfter = drivers.slice(
			r3e.data.Position,
			r3e.data.DriverData.length
		);
		let afterDiff = 0;
		driversAfter.forEach((driver) => {
			afterDiff += driver.meta.TimeDeltaFront;
			if (afterDiff < 120) {
				driver.diff =
					afterDiff > 60
						? formatTime(afterDiff, 'm:ss.SSS', true)
						: formatTime(afterDiff, 's.SSS', true);
			} else {
				driver.diff =
					Math.abs(driver.lapDiff) > 1
						? (driver.diff = `-${Math.abs(driver.lapDiff)} ${_(
								'laps'
						  )}`)
						: (driver.diff = `-${Math.abs(driver.lapDiff)} ${_(
								'lap'
						  )}`);
			}
		});
		this.playerPosition = r3e.data.Position;
	}

	private calculateDiffsRaceRelative(drivers: IDriverInfo[]) {
		let userPosition = 0;
		drivers.forEach((driver, i) => {
			if (driver.meta.DriverInfo.SlotId === r3e.data.VehicleInfo.SlotId) {
				userPosition = i;
			}
		});
		const userLapTime = r3e.data.LapDistance;
		drivers.forEach((driver, i) => {
			if (driver.isUser) {
				driver.diff = '';
				return;
			}

			let diff = userLapTime - driver.meta.LapDistance;
			if (diff < 0 && i > userPosition) {
				diff =
					userLapTime -
					(driver.meta.LapDistance - r3e.data.LayoutLength);
			}

			if (diff > 0 && i < userPosition) {
				diff =
					userLapTime -
					(driver.meta.LapDistance + r3e.data.LayoutLength);
			}

			const prefix = diff > 0 ? '+' : '';
			driver.diff = `${prefix}${diff.toFixed(0)}m`;
		});
	}

	private getPlayerPositionText(): string {
		const isntRace = r3e.data.SessionType !== ESession.Race;
		if (isntRace) {
			const bestTime = r3e.data.SectorTimesBestSelf.Sector3;
			return bestTime !== INVALID
				? bestTime > 60
					? formatTime(Math.max(0, bestTime), 'm:ss.SSS')
					: formatTime(Math.max(0, bestTime), 's.SSS')
				: '-';
		}

		const lapTime = r3e.data.LapTimeCurrentSelf;
		return lapTime !== INVALID
			? lapTime > 60
				? formatTime(Math.max(0, lapTime), 'm:ss.SSS')
				: formatTime(Math.max(0, lapTime), 's.SSS')
			: '-';
	}

	render() {
		const playerIsAlone = this.playerCount === 1;
		if (playerIsAlone && this.props.relative) {
			return null;
		}

		const willOverlapPitMenu =
			this.props.relative && this.pitState === EPitState.Pitting;
		if (willOverlapPitMenu) {
			return null;
		}

		const onlyShowInRace =
			this.props.relative && this.sessionType !== ESession.Race;
		if (onlyShowInRace) {
			return null;
		}

		const notInRacePhase = this.sessionPhase < ESessionPhase.Countdown;
		if (notInRacePhase) {
			return null;
		}

		const positionOffset = 7 - this.playerPosition;

		let sessionName = '';
		switch (this.sessionType) {
			case 0:
				sessionName = _('Practice');
				break;
			case 1:
				sessionName = _('Qualification');
				break;
			case 2:
				sessionName = _('Race');
				break;
			case 3:
				sessionName = _('Warmup');
				break;
		}

		return (
			<div
				className={classNames(
					'positionBarContainer',
					this.props.relative ? 'relative' : 'normal',
					{
						shouldShow: !!this.drivers.length
					}
				)}
				{...widgetSettings(this.props)}
			>
				{this.sessionPhase !== INVALID && (
					<div
						className={classNames(
							style.positionBar,
							this.props.className
						)}
					>
						{times(!this.props.relative ? positionOffset : 0).map(
							(i) => {
								return (
									<div
										key={`empty-${i}`}
										className="player"
									/>
								);
							}
						)}
						{this.drivers.map((player, i) => {
							return (
								<PositionEntry
									key={`${player.id}-${i}`}
									player={player}
									relative={this.props.relative}
								/>
							);
						})}
					</div>
				)}

				{!this.props.relative &&
					this.props.settings.subSettings.currentPosition.enabled &&
					this.position !== INVALID &&
					this.sessionType === ESession.Race && (
						<div className="currentPosition">
							<span className="mono">
								{this.position}/{this.classDriverCount}
							</span>
							<div className="label">{_('Position')}</div>
						</div>
					)}

				{!this.props.relative &&
					this.props.settings.subSettings.lapTime.enabled &&
					this.sessionType !== ESession.Race && (
						<div className="currentPosition">
							<span className="mono">
								{this.lapTimeCurrentSelf !== INVALID
									? formatTime(
											this.lapTimeCurrentSelf,
											'm:ss.SSS'
									  )
									: '-:--.---'}
							</span>
							<div className="label">{_('Lap time')}</div>
						</div>
					)}

				{!this.props.relative &&
					this.props.settings.subSettings.currentLap.enabled &&
					this.maxLaps !== INVALID && (
						<div className="currentLap">
							<span className="mono">
								{this.currentLap}/{this.maxLaps}
							</span>
							<div className="label">{_('Lap')}</div>
						</div>
					)}

				{!this.props.relative &&
					this.props.settings.subSettings.sessionTime.enabled &&
					this.sessionTimeRemaining !== INVALID && (
						<div className="sessionTime">
							<span className="mono">
								{formatTime(
									this.sessionTimeRemaining,
									'H:mm:ss'
								)}
							</span>
							<div className="label">{sessionName}</div>
						</div>
					)}
			</div>
		);
	}
}

interface IEntryProps extends React.HTMLAttributes<HTMLDivElement> {
	player: IDriverInfo;
	relative: boolean;
}

@observer
export class PositionEntry extends React.Component<IEntryProps, {}> {
	constructor(props: IEntryProps) {
		super(props);
	}
	render() {
		const player = this.props.player;
		return (
			<div
				className={classNames('player', {
					isUser: player.isUser,
					lapping: player.lapDiff < 0,
					sameLap: player.lapDiff === 0,
					lapped: player.lapDiff > 0
				})}
			>
				<div
					className="position"
					style={{
						color: this.props.relative
							? player.classColor
							: undefined
					}}
				>
					{player.position}
				</div>{' '}
				<div className="name">{player.name}</div>
				<div className="diff mono">{player.diff}</div>
				<div
					className="classStyle"
					style={{
						borderTop: !this.props.relative
							? `3px solid ${player.classColor}`
							: undefined,
						borderLeft: this.props.relative
							? `3px solid ${player.classColor}`
							: undefined
					}}
				/>
			</div>
		);
	}
}
