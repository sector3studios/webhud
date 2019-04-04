import { action, observable } from 'mobx';
import { classNames, widgetSettings } from './../../lib/utils';
import { EControl } from './../../types/r3eTypes';
import { IWidgetSetting } from '../app/app';
import { observer } from 'mobx-react';
import r3e, { registerUpdate, unregisterUpdate } from '../../lib/r3e';
import React from 'react';
import style from './inputs.scss';
import SvgIcon from '../svgIcon/svgIcon';
interface IProps extends React.HTMLAttributes<HTMLDivElement> {
	settings: IWidgetSetting;
}

@observer
export default class Inputs extends React.Component<IProps, {}> {
	@observable
	throttlePedal = 0;

	@observable
	brakePedal = 0;

	@observable
	clutchPedal = 0;

	@observable
	wheelTurn = 0;

	constructor(props: IProps) {
		super(props);

		registerUpdate(this.update);
	}

	componentWillUnmount() {
		unregisterUpdate(this.update);
	}

	@action
	private update = () => {
		// Use raw input if player is driving
		if (r3e.data.ControlType === EControl.Player) {
			this.throttlePedal = r3e.data.ThrottleRaw;
			this.brakePedal = r3e.data.BrakeRaw;
			this.clutchPedal = r3e.data.ClutchRaw;
		} else {
			this.throttlePedal = r3e.data.Throttle;
			this.brakePedal = r3e.data.Brake;
			this.clutchPedal = r3e.data.Clutch;
		}

		this.wheelTurn =
			r3e.data.SteerInputRaw * (r3e.data.SteerWheelRangeDegrees / 2);
	};

	render() {
		return (
			<div
				{...widgetSettings(this.props)}
				className={classNames(style.inputs, this.props.className, {
					hasWheel: this.props.settings.subSettings.steeringInput
						.enabled
				})}
			>
				{/* Clutch */}
				<div className="barContainer">
					{!!this.clutchPedal && (
						<div
							className="bar clutchPedal"
							style={{
								height: `${this.clutchPedal * 100}%`
							}}
						/>
					)}
				</div>

				{/* Brake */}
				<div className="barContainer">
					{!!this.brakePedal && (
						<div
							className="bar brakePedal"
							style={{
								height: `${this.brakePedal * 100}%`
							}}
						/>
					)}
				</div>

				{/* Throttle */}
				<div className="barContainer">
					{!!this.throttlePedal && (
						<div
							className="bar throttlePedal"
							style={{
								height: `${this.throttlePedal * 100}%`
							}}
						/>
					)}
				</div>
				{this.props.settings.subSettings.steeringInput.enabled && (
					<SvgIcon
						className="steeringWheel"
						src={require('./../../img/icons/wheel.svg')}
						style={{
							transform: `rotate(${this.wheelTurn}deg)`
						}}
					/>
				)}
			</div>
		);
	}
}
