import { action, observable } from 'mobx';
import { classNames, mpsToKph } from './../../lib/utils';
import { observer } from 'mobx-react';
import _ from './../../translate';
import r3e, { registerUpdate, unregisterUpdate } from '../../lib/r3e';
import React from 'react';
import style from './pitLimiter.scss';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {}

@observer
export default class PitLimiter extends React.Component<IProps, {}> {
	@observable
	inPitLane = 0;

	@observable
	pitlaneMax = 0;

	@observable
	speed = 0;

	constructor(props: IProps) {
		super(props);

		registerUpdate(this.update);
	}

	componentWillUnmount() {
		unregisterUpdate(this.update);
	}

	@action
	private update = () => {
		this.inPitLane = r3e.data.InPitlane;
		this.speed = mpsToKph(r3e.data.CarSpeed);
		this.pitlaneMax = mpsToKph(r3e.data.SessionPitSpeedLimit);
	};

	render() {
		return (
			<div
				className={classNames(style.pitLimiter, this.props.className, {
					warning: this.speed > 80,
					shouldShow: this.inPitLane === 1 && this.speed > 10
				})}
			>
				<div className="max">
					{_('In Pit Lane')}:{' '}
					<span className="mono">{this.pitlaneMax.toFixed(0)}</span>{' '}
					{_('Kph')}
				</div>
				<div className="current">
					{_('Current speed')}:{' '}
					<span className="mono">{this.speed.toFixed(0)}</span>{' '}
					{_('Kph')}
				</div>
			</div>
		);
	}
}
