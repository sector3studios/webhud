import { action, observable } from 'mobx';
import { classNames, widgetSettings, base64ToString } from './../../lib/utils';
import { IWidgetSetting } from '../app/app';
import { observer } from 'mobx-react';
import _ from './../../translate';
import r3e, { registerUpdate, unregisterUpdate } from '../../lib/r3e';
import React from 'react';
import ReconnectingWebSocket from '../../lib/reconnecting-websocket';
import style from './crewChief.scss';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
	settings: IWidgetSetting;
}

@observer
export default class CrewChief extends React.Component<IProps, {}> {
	@observable
	driverName = '';

	@observable
	isActive = false;

	pingInterval: number;

	cachedNames = {};
	ws: ReconnectingWebSocket;

	constructor(props: IProps) {
		super(props);

		registerUpdate(this.update);

		this.ws = new ReconnectingWebSocket('ws://localhost:8071/crewchief');
		this.ws.reconnectInterval = 10000;
		this.ws.onmessage = (e) => {
			const data: {
				channelOpen: boolean;
			} = JSON.parse(e.data);
			this.setActive(data.channelOpen);
		};

		this.pingInterval = setInterval(() => {
			// Each time we send the server a message it will respond with the data
			if (this.ws.readyState !== WebSocket.OPEN) {
				return;
			}
			this.ws.send('');
		}, 100);
	}

	componentWillUnmount() {
		this.ws.close();
		clearInterval(this.pingInterval);
		unregisterUpdate(this.update);
	}

	formatName(name: string) {
		if (this.cachedNames[name]) {
			return this.cachedNames[name];
		}
		this.cachedNames[name] = name
			.toString()
			.replace(/(.)[^ ]*? (.*)/, '$1. $2');
		return this.cachedNames[name];
	}

	@action
	private update = () => {
		this.driverName = base64ToString(r3e.data.PlayerName);
	};

	@action
	private setActive = (active: boolean) => {
		this.isActive = active;
	};

	render() {
		if (!this.isActive) {
			return null;
		}

		return (
			<div
				{...widgetSettings(this.props)}
				className={classNames(style.crewChief, this.props.className)}
			>
				<div className="driverName">
					<div className="inner">
						{this.formatName(this.driverName)}
					</div>
				</div>
				<div className="meta">
					{_('Team Radio')}
					<img
						className="waveForm"
						src={require('./../../img/crewchief.gif')}
					/>
				</div>
			</div>
		);
	}
}
