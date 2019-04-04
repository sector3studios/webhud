import { action, observable } from 'mobx';
import { classNames, INVALID } from './../../lib/utils';
import { ESession, ICutTrackPenalties } from './../../types/r3eTypes';
import { observer } from 'mobx-react';
import _ from './../../translate';
import r3e, { registerUpdate, unregisterUpdate } from '../../lib/r3e';
import React from 'react';
import style from './info.scss';
import SvgIcon from '../svgIcon/svgIcon';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {}

@observer
export default class Info extends React.Component<IProps, {}> {
	@observable
	currentLapValid = INVALID;

	@observable
	sessionType = INVALID;

	@observable
	completedLaps = 0;

	@observable
	lapTimeBestSelf = INVALID;

	@observable
	fuelPercent = INVALID;

	@observable
	penalties: ICutTrackPenalties = {
		DriveThrough: 0,
		StopAndGo: 0,
		PitStop: 0,
		TimeDeduction: 0,
		SlowDown: 0
	};

	penaltyTexts = {
		DriveThrough: 'DriveThrough: Serve wihin 3 laps'
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
		this.currentLapValid = r3e.data.CurrentLapValid;
		this.sessionType = r3e.data.SessionType;
		this.penalties = r3e.data.Penalties;
		this.completedLaps = r3e.data.CompletedLaps;
		this.lapTimeBestSelf = r3e.data.LapTimeBestSelf;
		this.fuelPercent = (r3e.data.FuelLeft / r3e.data.FuelCapacity) * 100;
	};

	render() {
		const notInRace = this.sessionType !== ESession.Race;
		const hasValidLap =
			(this.currentLapValid > 0 && this.completedLaps > 0) ||
			(this.sessionType === ESession.Qualify &&
				this.lapTimeBestSelf === INVALID);
		const showLapInvalid = notInRace && !hasValidLap;

		return (
			<div className={classNames(style.info, this.props.className)}>
				{showLapInvalid && (
					<div className="warning">
						<SvgIcon
							src={require('./../../img/icons/warning.svg')}
						/>
						{_('This lap will not count')}
					</div>
				)}
				{this.fuelPercent < 10 && (
					<div className="warning">
						<SvgIcon
							src={require('./../../img/icons/warning.svg')}
						/>
						{_('Fuel at')}: {`${this.fuelPercent.toFixed(1)}%`}
					</div>
				)}

				{/* Loop through all penalties and check if they should show */}
				{Object.keys(this.penalties)
					.filter((penaltyKey) => this.penalties[penaltyKey] > 0)
					.map((penaltyKey) => {
						return (
							<div key={penaltyKey} className="warning">
								<SvgIcon
									src={require('./../../img/icons/warning.svg')}
								/>
								{this.penaltyTexts[penaltyKey] || penaltyKey}
							</div>
						);
					})}
			</div>
		);
	}
}
