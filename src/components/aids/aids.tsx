import { action, observable } from 'mobx';
import { classNames, widgetSettings, INVALID } from './../../lib/utils';
import { IAidSettings } from './../../types/r3eTypes';
import { IWidgetSetting } from '../app/app';
import { observer } from 'mobx-react';
import r3e, { registerUpdate, unregisterUpdate } from '../../lib/r3e';
import React from 'react';
import style from './aids.scss';
import SvgIcon from '../svgIcon/svgIcon';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
	settings: IWidgetSetting;
}

@observer
export default class Aids extends React.Component<IProps, {}> {
	@observable
	sessionType = INVALID;

	@observable
	aids: IAidSettings = {
		// ABS; -1 = N/A, 0 = off, 1 = on, 5 = active
		Abs: INVALID,
		// TC; -1 = N/A, 0 = off, 1 = on, 5 = active
		Tc: INVALID,
		// ESP; -1 = N/A, 0 = off, 1 = low, 2 = medium, 3 = high, 5 = active
		Esp: INVALID,
		// Countersteer; -1 = N/A, 0 = off, 1 = on, 5 = active
		Countersteer: INVALID,
		// Cornering; -1 = N/A, 0 = off, 1 = on, 5 = active
		Cornering: INVALID
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
		this.sessionType = r3e.data.SessionType;

		this.aids = r3e.data.AidSettings;
	};

	render() {
		if (
			this.aids.Abs < 1 &&
			this.aids.Esp < 1 &&
			this.aids.Tc < 1 &&
			this.aids.Countersteer < 1 &&
			this.aids.Cornering < 1
		) {
			return null;
		}
		return (
			<div
				{...widgetSettings(this.props)}
				className={classNames(style.aids, this.props.className)}
			>
				<div className="inner">
					{this.aids.Abs > 0 && (
						<div
							className={classNames(
								'aid abs',
								`state-${this.aids.Abs}`
							)}
						>
							<SvgIcon
								src={require('./../../img/icons/abs.svg')}
							/>
						</div>
					)}
					{this.aids.Esp > 0 && (
						<div
							className={classNames(
								'aid esp',
								`state-${this.aids.Esp}`
							)}
						>
							<SvgIcon
								src={require('./../../img/icons/esp.svg')}
							/>
						</div>
					)}
					{this.aids.Tc > 0 && (
						<div
							className={classNames(
								'aid tc',
								`state-${this.aids.Tc}`
							)}
						>
							<SvgIcon
								src={require('./../../img/icons/tc.svg')}
							/>
						</div>
					)}
					{this.aids.Countersteer > 0 && (
						<div
							className={classNames(
								'aid countersteer',
								`state-${this.aids.Countersteer}`
							)}
						>
							<SvgIcon
								src={require('./../../img/icons/countersteer.svg')}
							/>
						</div>
					)}
					{this.aids.Cornering > 0 && (
						<div
							className={classNames(
								'aid cornering',
								`state-${this.aids.Cornering}`
							)}
						>
							<SvgIcon
								src={require('./../../img/icons/cornering.svg')}
							/>
						</div>
					)}
				</div>
			</div>
		);
	}
}
