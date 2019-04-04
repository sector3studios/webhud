import {
	classNames,
	INVALID,
	mpsToKph,
	rpsToRpm,
	widgetSettings
} from './../../lib/utils';
import { action, observable } from 'mobx';
import { EEngineType } from './../../types/r3eTypes';
import { IWidgetSetting } from '../app/app';
import { observer } from 'mobx-react';
import r3e, { registerUpdate, unregisterUpdate } from './../../lib/r3e';
import React from 'react';
import style from './motec.scss';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
	settings: IWidgetSetting;
}

@observer
export default class Motec extends React.Component<IProps, {}> {
	@observable
	speed = INVALID;

	@observable
	rpm = 0;

	@observable
	maxRpm = 0;

	@observable
	upshiftRps = 0;

	@observable
	gear = 0;

	gearNameLookup = {};

	constructor(props: IProps) {
		super(props);

		registerUpdate(this.update);

		const isElectric =
			r3e.data.VehicleInfo.EngineType === EEngineType.Electric;

		this.gearNameLookup = isElectric
			? {
					'-1': 'R',
					0: 'N',
					1: 'D',
					2: 'S'
			  }
			: {
					'-1': 'R',
					0: 'N'
			  };
	}

	componentWillUnmount() {
		unregisterUpdate(this.update);
	}

	@action
	private update = () => {
		this.speed = r3e.data.CarSpeed;
		this.rpm = rpsToRpm(r3e.data.EngineRps);
		this.maxRpm = rpsToRpm(r3e.data.MaxEngineRps);
		this.upshiftRps = rpsToRpm(r3e.data.UpshiftRps);
		this.gear = r3e.data.Gear;
	};

	render() {
		const rmpMaxed = this.rpm > this.maxRpm * 0.97;
		const rpmOptimum = this.rpm > this.upshiftRps * 0.92;
		return (
			<div
				{...widgetSettings(this.props)}
				className={classNames(style.motec, this.props.className, {
					rmpMaxed,
					rpmOptimum,
					shouldShow: this.speed !== INVALID
				})}
			>
				{/* Speed*/}
				<div className="speed mono">
					{mpsToKph(this.speed).toFixed(0)}
				</div>

				{/* RPM */}
				<div className="rpm">
					<div
						className="rpmBar"
						style={{
							width: `${(this.rpm / this.maxRpm) * 100}%`
						}}
					/>
				</div>

				{/* Gear */}
				<div className="gear mono">
					{this.gearNameLookup[this.gear] || this.gear}
				</div>
			</div>
		);
	}
}
