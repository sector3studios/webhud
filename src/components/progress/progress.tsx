import {
	classNames,
	formatTime,
	widgetSettings,
	INVALID
} from './../../lib/utils';
import { action, observable } from 'mobx';
import { ESession, EPitState } from './../../types/r3eTypes';
import { IWidgetSetting } from '../app/app';
import { observer } from 'mobx-react';
import _ from './../../translate';
import r3e, { registerUpdate, unregisterUpdate } from './../../lib/r3e';
import React from 'react';
import style from './progress.scss';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
	settings: IWidgetSetting;
}

@observer
export default class Progress extends React.Component<IProps, {}> {
	@observable
	currentDifference = INVALID;
	lastDifference = INVALID;
	differences: number[] = [];

	@observable
	lapDistanceFraction = 0;

	@observable
	isImproving = 0;

	@observable
	sessionType = INVALID;

	@observable
	estimatedPosition = 0;

	@observable
	estimatedLaptime = 10000;

	@observable
	estimatedDeltaNext = INVALID;

	@observable
	lapTimeCurrentSelf = INVALID;

	@observable
	startLights = INVALID;

	@observable
	sectorStartFactors = {
		Sector1: 0,
		Sector2: 0,
		Sector3: 0
	};

	@observable
	sectorTimesBestSelf = {
		Sector1: INVALID,
		Sector2: INVALID,
		Sector3: INVALID
	};

	@observable
	pitState = INVALID;

	previousDeltaInfront = 0;

	lastSessionType: number | null = null;

	// seconds
	maxImprovingValue = 0.003;
	improvingSmoothness = 100;

	constructor(props: IProps) {
		super(props);

		registerUpdate(this.update);
	}

	componentWillUnmount() {
		unregisterUpdate(this.update);
	}

	@action
	private updateDifferences = () => {
		if (this.lastDifference) {
			const difference = this.lastDifference - this.currentDifference;
			this.differences.push(difference);
			if (this.differences.length > 10) {
				this.differences = this.differences.slice(1);
				const averageDifference =
					this.differences.reduce((p, c) => p + c, 0) /
					this.differences.length;

				const deltaTarget = averageDifference - this.isImproving;

				this.isImproving += deltaTarget / this.improvingSmoothness || 0;
			}
		}
		this.lastDifference = this.currentDifference;
	};

	@action
	private update = () => {
		this.pitState = r3e.data.PitState;
		this.sessionType = r3e.data.SessionType;
		this.sectorStartFactors = r3e.data.SectorStartFactors;
		this.startLights = r3e.data.StartLights;

		if (this.sessionType === ESession.Race) {
			this.updateRace();
		} else {
			this.updatePracticeQualify();
		}
	};

	@action
	private updateRace() {
		this.lastSessionType = r3e.data.SessionType;
		this.lapDistanceFraction = r3e.data.LapDistanceFraction;
		this.currentDifference = this.getClassTimeDeltaInfront();
		this.updateDifferences();
	}

	private getClassTimeDeltaInfront() {
		let classTimeDelta = 0;
		let hasFoundOpponent = false;
		// Iterate backwards from the opponent infront of the driver
		// and append their timeDeltas to get the total
		for (let i = r3e.data.Position - 2; i >= 0; i -= 1) {
			const driver = r3e.data.DriverData[i];
			classTimeDelta += driver.TimeDeltaBehind;

			const isSameClass =
				driver.DriverInfo.ClassPerformanceIndex ===
				r3e.data.VehicleInfo.ClassPerformanceIndex;
			if (isSameClass) {
				hasFoundOpponent = true;
				break;
			}
		}

		if (!hasFoundOpponent) {
			return INVALID;
		}

		return classTimeDelta;
	}

	@action
	private updatePracticeQualify() {
		this.sectorTimesBestSelf = r3e.data.SectorTimesBestSelf;
		this.lapTimeCurrentSelf = r3e.data.LapTimeCurrentSelf;

		const shouldReset =
			this.lastSessionType !== null &&
			this.lastSessionType !== r3e.data.SessionType;

		if (
			shouldReset ||
			this.lapDistanceFraction - r3e.data.LapDistanceFraction > 0.5
		) {
			this.differences.length = 0;
		}

		if (this.lapTimeCurrentSelf === INVALID) {
			this.lapDistanceFraction = r3e.data.LapDistanceFraction;
			return;
		}

		this.lastSessionType = r3e.data.SessionType;
		this.lapDistanceFraction = r3e.data.LapDistanceFraction;

		if (
			this.sectorTimesBestSelf.Sector3 === INVALID ||
			r3e.data.TimeDeltaBestSelf === -1000
		) {
			return;
		}

		this.currentDifference = r3e.data.TimeDeltaBestSelf;

		// Estimated position
		this.estimatedLaptime =
			r3e.data.LapTimeBestSelf + (this.currentDifference || 0);

		let estimatedPosition = 1;
		this.estimatedDeltaNext = 1;
		const driverLength = r3e.data.DriverData.length;
		for (let i = 0; i < driverLength; i++) {
			const driver = r3e.data.DriverData[i];
			const isSameClass =
				driver.DriverInfo.ClassPerformanceIndex ===
				r3e.data.VehicleInfo.ClassPerformanceIndex;

			if (!isSameClass) {
				continue;
			}

			if (
				driver.SectorTimeBestSelf.Sector3 > this.estimatedLaptime ||
				driver.PlaceClass >= r3e.data.PositionClass
			) {
				break;
			}
			this.estimatedDeltaNext = Math.min(
				1,
				this.estimatedLaptime - driver.SectorTimeBestSelf.Sector3
			);
			estimatedPosition = driver.PlaceClass + 1;
		}
		this.estimatedPosition = estimatedPosition;

		this.updateDifferences();
	}

	getBarWidth = (direction: number) => {
		// this.currentDifference
		const proc = Math.min(
			(this.isImproving / this.maxImprovingValue) * direction * 50,
			50
		);
		return `${proc}%`;
	};

	render() {
		const inPits = this.pitState >= EPitState.Entered;
		const hideInRace =
			this.props.settings.subSettings.hideInRace.enabled &&
			this.sessionType === ESession.Race;

		if (inPits || hideInRace) {
			return null;
		}

		if (this.startLights < 6) {
			return null;
		}

		if (this.currentDifference === INVALID) {
			return null;
		}

		return (
			<div
				{...widgetSettings(this.props)}
				className={classNames(style.progress, this.props.className, {
					shouldShow:
						this.lapTimeCurrentSelf !== INVALID ||
						this.sessionType === ESession.Race,
					race: this.sessionType === ESession.Race,
					qualify: this.sessionType !== ESession.Race,
					loosing: this.isImproving < -0.001,
					gaining: this.isImproving > 0.001,
					overallLoosing: this.currentDifference > 0,
					overallGaining: this.currentDifference < 0
				})}
			>
				<div className="estimateContainer">
					<div className="estimate ">
						{this.props.settings.subSettings.deltaText.enabled ? (
							<span className="mono">
								{formatTime(
									this.sessionType !== ESession.Race
										? this.currentDifference
										: -this.currentDifference,
									's.SSS',
									true
								)}
							</span>
						) : null}
						{this.props.settings.subSettings.deltaNextPosition
							.enabled &&
							this.sessionType !== ESession.Race && (
								<div className="deltaNextContainer">
									<div
										className="deltaNext"
										style={{
											width: `${(1 -
												this.estimatedDeltaNext) *
												100}%`
										}}
									/>
								</div>
							)}
						{this.sessionType !== ESession.Race && (
							<div className="qualifyInfo">
								{this.props.settings.subSettings
									.estimatedLapTime.enabled && (
									<div className="esimatedLapTime">
										{_('Est. Time')}:{' '}
										<span className="mono">
											{formatTime(
												this.estimatedLaptime,
												'm:ss.SSS'
											)}
										</span>
									</div>
								)}
								{this.props.settings.subSettings
									.estimatedPosition.enabled && (
									<div className="esimatedPosition">
										{_('Est. Pos')}:{' '}
										<span className="mono">
											{this.estimatedPosition}
										</span>
									</div>
								)}
							</div>
						)}
					</div>
					{this.props.settings.subSettings.deltaBars.enabled && (
						<div className={classNames('simple')}>
							<div
								className="bad"
								style={{
									width:
										this.isImproving < 0
											? this.getBarWidth(-1)
											: 0
								}}
							/>
							<div
								className="good"
								style={{
									width:
										this.isImproving > 0
											? this.getBarWidth(1)
											: 0
								}}
							/>
						</div>
					)}

					<div className="sectors">
						<div
							className={classNames('sector', {
								pb:
									r3e.data.SectorTimesCurrentSelf.Sector1 <
									r3e.data.BestIndividualSectorTimeSelf
										.Sector1,
								gb:
									r3e.data.SectorTimesCurrentSelf.Sector1 <
									r3e.data.BestIndividualSectorTimeLeaderClass
										.Sector1,
								inactive:
									r3e.data.SectorTimesCurrentSelf.Sector1 ===
									-1
							})}
						/>
						<div
							className={classNames('sector', {
								pb:
									r3e.data.SectorTimesCurrentSelf.Sector2 <
									r3e.data.BestIndividualSectorTimeSelf
										.Sector2,
								gb:
									r3e.data.SectorTimesCurrentSelf.Sector2 <
									r3e.data.BestIndividualSectorTimeLeaderClass
										.Sector2,
								inactive:
									r3e.data.SectorTimesCurrentSelf.Sector2 ===
									-1
							})}
						/>
						<div
							className={classNames('sector', {
								pb:
									r3e.data.SectorTimesCurrentSelf.Sector3 <
									r3e.data.BestIndividualSectorTimeSelf
										.Sector3,
								gb:
									r3e.data.SectorTimesCurrentSelf.Sector3 <
									r3e.data.BestIndividualSectorTimeLeaderClass
										.Sector3,
								inactive:
									r3e.data.SectorTimesCurrentSelf.Sector3 ===
									-1
							})}
						/>
					</div>
				</div>
			</div>
		);
	}
}
