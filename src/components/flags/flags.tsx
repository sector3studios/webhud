import { action, observable } from 'mobx';
import { classNames, INVALID, widgetSettings } from './../../lib/utils';
import { IFlags } from './../../types/r3eTypes';
import { IWidgetSetting } from '../app/app';
import { observer } from 'mobx-react';
import _ from './../../translate';
import r3e, { registerUpdate, unregisterUpdate } from '../../lib/r3e';
import React from 'react';
import style from './flags.scss';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
	settings: IWidgetSetting;
}

@observer
export default class Flags extends React.Component<IProps, {}> {
	@observable
	flags: IFlags = {
		// Whether yellow flag is currently active
		// -1 = no data
		//  0 = not active
		//  1 = active
		Yellow: INVALID,

		// Whether yellow flag was caused by current slot
		// -1 = no data
		//  0 = didn't cause it
		//  1 = caused it
		YellowCausedIt: INVALID,

		// Whether overtake of car in front by current slot is allowed
		// under yellow flag
		// -1 = no data
		//  0 = not allowed
		//  1 = allowed
		YellowOvertake: INVALID,

		// Whether you have gained positions illegaly under yellow flag to give back
		// -1 = no data
		//  0 = no positions gained
		//  n = number of positions gained
		YellowPositionsGained: INVALID,

		// Yellow flag for each sector; -1 = no data, 0 = not active, 1 = active
		SectorYellow: {
			Sector1: INVALID,
			Sector2: INVALID,
			Sector3: INVALID
		},

		// Distance into track for closest yellow, -1.0 if no yellow flag exists
		// Unit: Meters (m)
		ClosestYellowDistanceIntoTrack: INVALID,

		// Whether blue flag is currently active
		// -1 = no data
		//  0 = not active
		//  1 = active
		Blue: INVALID,

		// Whether black flag is currently active
		// -1 = no data
		//  0 = not active
		//  1 = active
		Black: INVALID,

		// Whether green flag is currently active
		// -1 = no data
		//  0 = not active
		//  1 = active
		Green: INVALID,

		// Whether checkered flag is currently active
		// -1 = no data
		//  0 = not active
		//  1 = active
		Checkered: INVALID,

		// Whether white flag is currently active and reason
		// -1 = no data
		//  0 = not active
		//  1 = debris on track
		//  2 = slow cars ahead
		White: INVALID,

		// Whether black and white flag is currently active and reason
		// -1 = no data
		//  0 = not active
		//  1 = blue flag 1st warning
		//  2 = blue flag 2nd warning
		//  3 = wrong way
		//  4 = cutting track
		BlackAndWhite: INVALID
	};

	constructor(props: IProps) {
		super(props);

		registerUpdate(this.update);
	}

	componentWillUnmount() {
		unregisterUpdate(this.update);
	}

	flagText = () => {
		return {
			BlackAndWhite: {
				1: _('Blue flag 1st warning'),
				2: _('Blue flag 2nd warning'),
				3: _('Wrong way'),
				4: _('Cutting track')
			}
		};
	};

	@action
	private update = () => {
		this.flags = r3e.data.Flags;
	};

	render() {
		const active = 1;
		return (
			<div
				{...widgetSettings(this.props)}
				className={classNames(style.flags, this.props.className)}
			>
				{this.flags.Black === active && (
					<div className="flag black">
						<div className="flagBlock" />
						<div className="text">{_('Black flag')}</div>
					</div>
				)}

				{this.flags.Yellow === active && (
					<div className="flag yellow">
						<div className="flagBlock" />
						<div className="text">{_('Hazard on the track')}</div>
					</div>
				)}

				{this.flags.Blue === active && (
					<div className="flag blue">
						<div className="flagBlock" />
						<div className="text">
							{_('Yield to the car behind')}
						</div>
					</div>
				)}

				{this.flags.Green === active && (
					<div className="flag green">
						<div className="flagBlock" />
						<div className="text">{_('Go!')}</div>
					</div>
				)}

				{this.flags.Checkered === active && (
					<div className="flag checkered">
						<div className="flagBlock" />
						<div className="text">
							{_('Checkered flag: Last lap!')}
						</div>
					</div>
				)}

				{this.flags.BlackAndWhite > 0 && (
					<div className="flag blackAndWhite">
						<div className="flagBlock" />
						<div className="text">
							{
								this.flagText().BlackAndWhite[
									this.flags.BlackAndWhite
								]
							}
						</div>
					</div>
				)}

				{this.flags.White > 0 && (
					<div className="flag white">
						<div className="flagBlock" />
						<div className="text">{_('Slow cars ahead')}</div>
					</div>
				)}
			</div>
		);
	}
}
