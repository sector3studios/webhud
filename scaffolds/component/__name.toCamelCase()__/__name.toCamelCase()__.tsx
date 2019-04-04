import { action, observable } from 'mobx';
import { classNames, widgetSettings } from './../../lib/utils';
import { extend } from 'lodash-es';
import { IWidgetSetting } from '../app/app';
import { observer } from 'mobx-react';
import r3e, { registerUpdate, unregisterUpdate } from '../../lib/r3e';
import React from 'react';
import style from './<%= name.toCamelCase() %>.scss';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
	settings: IWidgetSetting;
}

@observer
export default class <%= name.toPascalCase() %> extends React.Component<IProps, {}> {
	@observable
	sessionType = -1;

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
	}

	render() {
		return (
			<div 
				{...widgetSettings(this.props)}
				className={
					classNames(style.<%= name.toCamelCase() %>, this.props.className)
				}
			>
				{this.sessionType}
			</div>
		);
	}
}
