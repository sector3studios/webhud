import {
	classNames,
	widgetSettings,
	lerpColor,
	INVALID
} from './../../lib/utils';
import { action, observable } from 'mobx';
import { ITireData, ITireTemp, IBrakeTemp } from './../../types/r3eTypes';
import { IWidgetSetting } from '../app/app';
import { observer } from 'mobx-react';
import r3e, { registerUpdate, unregisterUpdate } from '../../lib/r3e';
import React from 'react';
import style from './tires.scss';
interface IProps extends React.HTMLAttributes<HTMLDivElement> {
	settings: IWidgetSetting;
}

@observer
export default class Tires extends React.Component<IProps, {}> {
	@observable
	sessionType = -1;

	@observable
	tireWear: ITireData<number> = {
		FrontLeft: 0,
		FrontRight: 0,
		RearLeft: 0,
		RearRight: 0
	};

	@observable
	tireDirt: ITireData<number> = {
		FrontLeft: 0,
		FrontRight: 0,
		RearLeft: 0,
		RearRight: 0
	};

	@observable
	tireTemp: ITireData<ITireTemp> = {
		FrontLeft: {
			CurrentTemp: {
				Left: INVALID,
				Center: INVALID,
				Right: INVALID
			},
			OptimalTemp: INVALID,
			ColdTemp: INVALID,
			HotTemp: INVALID
		},
		FrontRight: {
			CurrentTemp: {
				Left: INVALID,
				Center: INVALID,
				Right: INVALID
			},
			OptimalTemp: INVALID,
			ColdTemp: INVALID,
			HotTemp: INVALID
		},
		RearLeft: {
			CurrentTemp: {
				Left: INVALID,
				Center: INVALID,
				Right: INVALID
			},
			OptimalTemp: INVALID,
			ColdTemp: INVALID,
			HotTemp: INVALID
		},
		RearRight: {
			CurrentTemp: {
				Left: INVALID,
				Center: INVALID,
				Right: INVALID
			},
			OptimalTemp: INVALID,
			ColdTemp: INVALID,
			HotTemp: INVALID
		}
	};

	@observable
	brakeTemp: ITireData<IBrakeTemp> = {
		FrontLeft: {
			CurrentTemp: INVALID,
			OptimalTemp: INVALID,
			ColdTemp: INVALID,
			HotTemp: INVALID
		},
		FrontRight: {
			CurrentTemp: INVALID,
			OptimalTemp: INVALID,
			ColdTemp: INVALID,
			HotTemp: INVALID
		},
		RearLeft: {
			CurrentTemp: INVALID,
			OptimalTemp: INVALID,
			ColdTemp: INVALID,
			HotTemp: INVALID
		},
		RearRight: {
			CurrentTemp: INVALID,
			OptimalTemp: INVALID,
			ColdTemp: INVALID,
			HotTemp: INVALID
		}
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
		this.brakeTemp = r3e.data.BrakeTemp;
		this.tireWear = r3e.data.TireWear;
		this.tireDirt = r3e.data.TireDirt;
		this.tireTemp = r3e.data.TireTemp;
	};

	private getBrakeColor(temp: IBrakeTemp) {
		const currentTemp = temp.CurrentTemp;
		const red = '#990000';
		const green = '#009900';
		const blue = '#000099';

		let fromColor = green;
		let toColor = green;
		let amount = 0;

		// Magic numbers decided based on some random sample cars

		if (currentTemp < temp.ColdTemp) {
			return blue;
		}
		if (currentTemp > temp.HotTemp) {
			return red;
		}
		if (currentTemp > temp.OptimalTemp) {
			const localDelta = temp.HotTemp - temp.OptimalTemp;
			const deltaFromCold = currentTemp - temp.OptimalTemp;
			amount = Math.min(1, deltaFromCold / localDelta);
			fromColor = green;
			toColor = red;
		} else {
			const localDelta = temp.OptimalTemp - temp.ColdTemp;
			const deltaFromCold = currentTemp - temp.ColdTemp;
			amount = Math.min(1, deltaFromCold / localDelta);

			fromColor = blue;
			toColor = green;
		}

		return lerpColor(fromColor, toColor, amount);
	}

	private getTireTempColor(temp: ITireTemp) {
		const currentTemp = temp.CurrentTemp.Center;
		const red = '#990000';
		const green = '#009900';
		const blue = '#000099';

		let fromColor = green;
		let toColor = green;
		let amount = 0;

		if (currentTemp < temp.ColdTemp) {
			return blue;
		}
		if (currentTemp > temp.HotTemp) {
			return red;
		}
		if (currentTemp > temp.OptimalTemp) {
			const localDelta = temp.HotTemp - temp.OptimalTemp;
			const deltaFromCold = currentTemp - temp.OptimalTemp;
			amount = Math.min(1, deltaFromCold / localDelta);
			fromColor = green;
			toColor = red;
		} else {
			const localDelta = temp.OptimalTemp - temp.ColdTemp;
			const deltaFromCold = currentTemp - temp.ColdTemp;
			amount = Math.min(1, deltaFromCold / localDelta);

			fromColor = blue;
			toColor = green;
		}

		return lerpColor(fromColor, toColor, amount);
	}

	render() {
		return (
			<div
				{...widgetSettings(this.props)}
				className={classNames(style.tires, this.props.className)}
			>
				{['FrontLeft', 'FrontRight', 'RearLeft', 'RearRight'].map(
					(property) => {
						const wheelClass = property.replace(/^./, (str) => {
							return str.toLowerCase();
						});
						return (
							<div
								key={property}
								className={classNames('wheel', wheelClass)}
							>
								<div className="temp mono">
									{this.tireTemp[
										property
									].CurrentTemp.Center.toFixed(0)}
									°
								</div>
								<div
									className={classNames('brake', wheelClass)}
									style={{
										background: this.getBrakeColor(
											this.brakeTemp[property]
										)
									}}
								/>
								<div className="tireWearContainer">
									<div
										className={classNames(
											'tireWear',
											wheelClass
										)}
										style={{
											height: `${this.tireWear[property] *
												100}%`,
											background: this.getTireTempColor(
												this.tireTemp[property]
											)
										}}
									/>
								</div>
								<div
									className="tireDirtOverlay"
									style={{
										opacity: this.tireDirt[property]
									}}
								/>
							</div>
						);
					}
				)}
			</div>
		);
	}
}
