import { action, observable } from 'mobx';
import { classNames, widgetSettings, INVALID } from './../../lib/utils';
import { ICarDamage } from './../../types/r3eTypes';
import { IWidgetSetting } from '../app/app';
import { observer } from 'mobx-react';
import _ from './../../translate';
import r3e, { registerUpdate, unregisterUpdate } from '../../lib/r3e';
import React from 'react';
import style from './damage.scss';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
	settings: IWidgetSetting;
}

@observer
export default class Damage extends React.Component<IProps, {}> {
	@observable
	carDamage: ICarDamage = {
		Engine: INVALID,
		Transmission: INVALID,
		Aerodynamics: INVALID,
		Suspension: INVALID,
		Unused1: INVALID,
		Unused2: INVALID
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
		this.carDamage = r3e.data.CarDamage;
	};

	render() {
		return (
			<div
				{...widgetSettings(this.props)}
				className={classNames(style.damage, this.props.className)}
			>
				<div className="carDamage">
					{/* Engine damage */}
					{this.carDamage.Engine !== INVALID && (
						<div
							className={classNames('part engine', {
								bad: this.carDamage.Engine < 1,
								broken: this.carDamage.Engine < 0.5
							})}
						>
							<div className="label">{_('Engine')}</div>
							<div className="barContainer">
								<div
									className="bar"
									style={{
										width: `${this.carDamage.Engine * 100}%`
									}}
								/>
							</div>
						</div>
					)}

					{/* Transmission damage */}
					{this.carDamage.Transmission !== INVALID && (
						<div
							className={classNames('part transmission', {
								bad: this.carDamage.Transmission < 1,
								broken: this.carDamage.Transmission < 0.5
							})}
						>
							<div className="label">{_('Transmission')}</div>
							<div className="barContainer">
								<div
									className="bar"
									style={{
										width: `${this.carDamage.Transmission *
											100}%`
									}}
								/>
							</div>
						</div>
					)}

					{/* Aerodynamics damage */}
					{this.carDamage.Aerodynamics !== INVALID && (
						<div
							className={classNames('part aerodynamics', {
								bad: this.carDamage.Aerodynamics < 1,
								broken: this.carDamage.Aerodynamics < 0.5
							})}
						>
							<div className="label">{_('Aerodynamics')}</div>
							<div className="barContainer">
								<div
									className="bar"
									style={{
										width: `${this.carDamage.Aerodynamics *
											100}%`
									}}
								/>
							</div>
						</div>
					)}

					{/* Suspension damage */}
					{this.carDamage.Suspension !== INVALID && (
						<div
							className={classNames('part suspension', {
								bad: this.carDamage.Suspension < 1,
								broken: this.carDamage.Suspension < 0.5
							})}
						>
							<div className="label">{_('Suspension')}</div>
							<div className="barContainer">
								<div
									className="bar"
									style={{
										width: `${this.carDamage.Suspension *
											100}%`
									}}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		);
	}
}
