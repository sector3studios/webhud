import { action, observable } from 'mobx';
import { classNames, widgetSettings } from './../../lib/utils';
import { IWidgetSetting } from '../app/app';
import { observer } from 'mobx-react';
import _ from './../../translate';
import r3e, { registerUpdate, unregisterUpdate } from '../../lib/r3e';
import React from 'react';
import style from './overtakingAids.scss';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
	settings: IWidgetSetting;
}

@observer
export default class OvertakingAids extends React.Component<IProps, {}> {
	@observable
	drs = {
		/** If DRS is equipped and allowed */
		/** 0 = No, 1 = Yes, -1 = N/A */
		Equipped: 0,
		/** Got DRS activation left */
		/** 0 = No, 1 = Yes, -1 = N/A */
		Available: 0,
		/** Number of DRS activations left this lap */
		/** Note: In sessions with 'endless' amount of drs activations per lap
		 * this value starts at :max: number */
		/** -1 = N/A */
		NumActivationsLeft: 0,
		/** DRS engaged */
		/** 0 = No, 1 = Yes, -1 = N/A */
		Engaged: 0
	};

	@observable
	pushToPass = {
		Available: 0,
		Engaged: 0,
		AmountLeft: 0,
		EngagedTimeLeft: 0,
		WaitTimeLeft: 0
	};

	@observable
	maxP2pTimeLeft = 0;

	@observable
	maxP2pWaitTimeLeft = 0;

	updateFunc: Function;
	constructor(props: IProps) {
		super(props);

		this.updateFunc = this.update.bind(this);
		registerUpdate(this.updateFunc);
	}

	componentWillUnmount() {
		unregisterUpdate(this.updateFunc);
	}

	@action
	private update() {
		this.drs = r3e.data.Drs;
		this.pushToPass = r3e.data.PushToPass;
		this.maxP2pTimeLeft = Math.max(
			this.pushToPass.EngagedTimeLeft,
			this.maxP2pTimeLeft
		);
		this.maxP2pWaitTimeLeft = Math.max(
			this.pushToPass.WaitTimeLeft,
			this.maxP2pWaitTimeLeft
		);
	}

	render() {
		return (
			<div
				className={classNames(
					style.overtakingAids,
					this.props.className
				)}
			>
				{this.drs.Equipped > 0 && (
					<div
						className={classNames('drs', {
							engaged: this.drs.Engaged > 0
						})}
					>
						{this.drs.NumActivationsLeft > 0 && (
							<div
								{...widgetSettings(this.props)}
								className="available"
							>
								{_('DRS')}:
								{this.drs.NumActivationsLeft > 99 ? (
									<span className="infinity">∞</span>
								) : (
									'x' + this.drs.NumActivationsLeft
								)}
							</div>
						)}
						<div className="meta">
							{this.drs.Engaged > 0 && (
								<div className="drsActive">
									<div className="title">
										{_('DRS Activated')}
									</div>
								</div>
							)}
						</div>
					</div>
				)}
				{this.pushToPass.Available && (
					<div
						className={classNames('pushToPass', {
							engaged: this.pushToPass.EngagedTimeLeft > 0,
							unavailable: this.pushToPass.WaitTimeLeft > 0
						})}
					>
						{this.pushToPass.AmountLeft > 0 && (
							<div
								{...widgetSettings(this.props)}
								className="available"
							>
								{_('P2P: x')}
								{this.pushToPass.AmountLeft}
							</div>
						)}
						<div className="meta">
							{this.pushToPass.EngagedTimeLeft > 0 && (
								<div className="timeLeft">
									<div className="title">
										{_('P2P')} - {_('time left')}
									</div>
									<div className="barContainer">
										<div
											className="bar"
											style={{
												width: `${(this.pushToPass
													.EngagedTimeLeft /
													this.maxP2pTimeLeft) *
													100}%`
											}}
										/>
									</div>
								</div>
							)}
							{this.pushToPass.WaitTimeLeft > 0 && (
								<div className="waitTimeLeft">
									<div className="title">
										{_('P2P - Wait')}
									</div>
									<div className="barContainer">
										<div
											className="bar"
											style={{
												width: `${(this.pushToPass
													.WaitTimeLeft /
													this.maxP2pWaitTimeLeft) *
													100}%`
											}}
										/>
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		);
	}
}
