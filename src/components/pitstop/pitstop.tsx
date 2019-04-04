import {
	classNames,
	formatTime,
	widgetSettings,
	INVALID
} from './../../lib/utils';
import { action, observable } from 'mobx';
import { EPitState, EPitWindow } from './../../types/r3eTypes';
import { IWidgetSetting } from '../app/app';
import { observer } from 'mobx-react';
import _ from './../../translate';
import r3e, { registerUpdate, unregisterUpdate } from '../../lib/r3e';
import React from 'react';
import style from './pitstop.scss';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
	settings: IWidgetSetting;
}

@observer
export default class Pitstop extends React.Component<IProps, {}> {
	@observable
	pitWindowStatus = INVALID;

	@observable
	pitState = INVALID;

	@observable
	pitWindowStart = INVALID;

	@observable
	pitWindowEnd = INVALID;

	@observable
	currentLap = INVALID;

	@observable
	numberOfLaps = INVALID;

	@observable
	sessionTimeRemaining = INVALID;

	@observable
	pitTotalDuration = INVALID;

	@observable
	pitElapsedTime = INVALID;

	@observable
	pit = {
		preparing: false,
		driverChange: false,
		refueling: false,
		frontTires: false,
		rearTires: false,
		frontWing: false,
		rearWing: false,
		suspension: false
	};

	constructor(props: IProps) {
		super(props);

		registerUpdate(this.update);
	}

	componentWillUnmount() {
		unregisterUpdate(this.update);
	}

	@action
	private update = () => {
		this.pitWindowStatus = r3e.data.PitWindowStatus;
		this.pitWindowStart = r3e.data.PitWindowStart;
		this.pitWindowEnd = r3e.data.PitWindowEnd;
		this.currentLap = r3e.data.CompletedLaps + 1;
		this.numberOfLaps = r3e.data.NumberOfLaps;
		this.sessionTimeRemaining = r3e.data.SessionTimeRemaining;

		this.pitTotalDuration = r3e.data.PitTotalDuration;
		this.pitElapsedTime = r3e.data.PitElapsedTime;
		this.pitState = r3e.data.PitState;

		const pitAction = r3e.data.PitAction;
		this.pit = {
			preparing: (pitAction & 1) !== 0,
			driverChange: (pitAction & 4) !== 0,
			refueling: (pitAction & 8) !== 0,
			frontTires: (pitAction & 16) !== 0,
			rearTires: (pitAction & 32) !== 0,
			frontWing: (pitAction & 64) !== 0,
			rearWing: (pitAction & 128) !== 0,
			suspension: (pitAction & 256) !== 0
		};
	};

	render() {
		const invalidStartAndEnd =
			this.pitWindowStart === INVALID && this.pitWindowEnd === INVALID;

		const diff = this.pitWindowEnd * 60 - this.pitWindowStart * 60;

		return (
			<div className={classNames(style.pitstop, this.props.className)}>
				{!invalidStartAndEnd &&
					this.pitWindowStatus === EPitWindow.Open && (
						<div
							{...widgetSettings(this.props)}
							className="pitInfo"
						>
							<div className="inner">
								<div className="title">
									{_('Pit window is open')}
								</div>
								{this.numberOfLaps !== INVALID ? (
									<div className="left">
										{_('Laps left to pit')}:{' '}
										{this.pitWindowEnd - this.currentLap}
									</div>
								) : (
									<div className="left">
										{_('Time left to pit')}:{' '}
										{formatTime(
											diff -
												(this.pitWindowEnd * 60 -
													this.sessionTimeRemaining),
											'm:ss'
										)}
									</div>
								)}
							</div>
						</div>
					)}

				{this.pitState === EPitState.Pitting && (
					<div className="pitInfoFixed">
						<div className="title">
							<div className="tasks">
								{this.pit.preparing && (
									<div className="task">{_('Preparing')}</div>
								)}
								{this.pit.driverChange && (
									<div className="task">
										{_('Driver Change')}
									</div>
								)}
								{this.pit.refueling && (
									<div className="task">{_('Refueling')}</div>
								)}
								{this.pit.frontTires && (
									<div className="task">
										{_('Front tires')}
									</div>
								)}
								{this.pit.rearTires && (
									<div className="task">
										{_('Rear tires')}
									</div>
								)}
								{this.pit.frontWing && (
									<div className="task">
										{_('Front wing')}
									</div>
								)}
								{this.pit.rearWing && (
									<div className="task">{_('Rear wing')}</div>
								)}
								{this.pit.suspension && (
									<div className="task">
										{_('Suspension')}
									</div>
								)}
								{!this.pit.preparing &&
									!this.pit.driverChange &&
									!this.pit.refueling &&
									!this.pit.frontTires &&
									!this.pit.rearTires &&
									!this.pit.frontWing &&
									!this.pit.rearWing &&
									!this.pit.suspension && (
										<div className="task">
											{_('Waiting...')}
										</div>
									)}
							</div>
						</div>
						<div className="barContainer">
							<div
								className="bar"
								style={{
									width: `${(this.pitElapsedTime /
										this.pitTotalDuration) *
										100}%`
								}}
							/>
						</div>
						<div className="totalTime">
							{_('Pit duration')}:{' '}
							<span className="mono">
								{formatTime(this.pitElapsedTime, 'm:ss')}
							</span>
							/
							<span className="mono">
								{formatTime(this.pitTotalDuration, 'm:ss')}
							</span>
						</div>
					</div>
				)}
			</div>
		);
	}
}
