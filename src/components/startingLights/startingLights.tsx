import { action, observable } from 'mobx';
import { classNames, widgetSettings, INVALID } from './../../lib/utils';
import { IWidgetSetting } from '../app/app';
import { observer } from 'mobx-react';
import { times } from 'lodash-es';
import r3e, { registerUpdate, unregisterUpdate } from '../../lib/r3e';
import React from 'react';
import style from './startingLights.scss';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
	settings: IWidgetSetting;
}

@observer
export default class StartingLights extends React.Component<IProps, {}> {
	@observable
	startLights = INVALID;

	lightCount = 5;

	constructor(props: IProps) {
		super(props);

		registerUpdate(this.update);
	}

	componentWillUnmount() {
		unregisterUpdate(this.update);
	}

	@action
	private update = () => {
		this.startLights = r3e.data.StartLights;
	}

	render() {
		if (this.startLights >= 6) {
			return null;
		}

		return (
			<div
				{...widgetSettings(this.props)}
				className={classNames(
					style.startingLights,
					this.props.className
				)}
			>
				<div className="inner">
					{times(this.lightCount).map((i) => {
						return (
							<div
								key={`light-${i}`}
								className={classNames('light', {
									active: this.startLights > i,
									green: this.startLights > this.lightCount
								})}
							/>
						);
					})}
				</div>
			</div>
		);
	}
}
