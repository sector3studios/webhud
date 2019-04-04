import { action, observable } from 'mobx';
import { classNames, widgetSettings } from './../../lib/utils';
import { IWidgetSetting } from '../app/app';
import { observer } from 'mobx-react';
import r3e, { registerUpdate, unregisterUpdate } from '../../lib/r3e';
import React from 'react';
import style from './fuel.scss';
import SvgIcon from '../svgIcon/svgIcon';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
	settings: IWidgetSetting;
}

@observer
export default class Fuel extends React.Component<IProps, {}> {
	@observable
	fuelPerLap = 0;

	@observable
	fuelLeft = 0;

	@observable
	fuelCapacity = 0;

	@observable
	fuelUseActive = 0;

	constructor(props: IProps) {
		super(props);

		registerUpdate(this.update);
	}

	componentWillUnmount() {
		unregisterUpdate(this.update);
	}

	@action
	private update = () => {
		this.fuelPerLap = r3e.data.FuelPerLap;
		this.fuelUseActive = r3e.data.FuelUseActive;
		this.fuelLeft = r3e.data.FuelLeft;
		this.fuelCapacity = r3e.data.FuelCapacity;
	};

	render() {
		return (
			<div
				{...widgetSettings(this.props)}
				className={classNames(style.fuel, this.props.className, {
					low: this.fuelLeft < this.fuelPerLap * 2
				})}
			>
				{!!this.fuelUseActive && (
					<div>
						<div className="fuelPerLap">
							{this.fuelPerLap.toFixed(1)}
						</div>
						<div className="barContainer">
							<div
								className="bar "
								style={{
									height: `${(this.fuelLeft /
										this.fuelCapacity) *
										100}%`
								}}
							/>
						</div>
						<SvgIcon src={require('./../../img/icons/fuel.svg')} />
						<div className="fuelLeft">
							{this.fuelLeft.toFixed(0)}
						</div>
					</div>
				)}
			</div>
		);
	}
}
