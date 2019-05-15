import {
	base64ToString,
	classNames,
	distance2d,
	mpsToKph,
	toDegrees,
	widgetSettings,
	INVALID,
	getClassColor
} from '../../lib/utils';
import { action, observable } from 'mobx';
import { IDriverData, EControl } from './../../types/r3eTypes';
import { IWidgetSetting } from '../app/app';
import { observer } from 'mobx-react';
import r3e, { registerUpdate, unregisterUpdate } from '../../lib/r3e';
import React from 'react';
import style from './spotting.scss';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
	settings: IWidgetSetting;
}

interface IDriver {
	x: number;
	y: number;
	distance: number;
	slot: number;
	isUser: boolean;
	isClose: boolean;
	name: string;
	angle: number;
	classPerformanceIndex: number;
}

interface IWarning {
	slot: number;
	name: string;
	distance: number;
}

interface IWarnings {
	left: IWarning;
	right: IWarning;
}

@observer
export default class Spotting extends React.Component<IProps, {}> {
	@observable
	drivers: IDriver[] = [];

	@observable
	speed = 0;

	@observable
	sessionPhase = INVALID;

	@observable
	controlType = INVALID;

	@observable
	warning: IWarnings = {
		left: { slot: INVALID, name: '', distance: 0 },
		right: { slot: INVALID, name: '', distance: 0 }
	};

	audio = new Audio();

	// Required otherwise there are issues with
	// The play() request was interrupted by a call to pause(). https://goo.gl/LdLk22
	audioIsPlaying = false;

	audioContext = new AudioContext();
	mediaElementSource = this.audioContext.createMediaElementSource(this.audio);
	stereoPanner = this.audioContext.createStereoPanner();

	driverPosition: IDriver | null = null;

	closeDistance = 12;
	minTriggerSpeed = 30;
	scale = 5;

	constructor(props: IProps) {
		super(props);

		registerUpdate(this.update);

		this.mediaElementSource.connect(this.stereoPanner);
		this.stereoPanner.connect(this.audioContext.destination);

		this.audio.src = require('./../../sounds/beep.wav');

		this.audio.onplaying = () => {
			this.audioIsPlaying = true;
		};

		this.audio.onpause = () => {
			this.audioIsPlaying = false;
		};
	}
	componentWillUnmount() {
		unregisterUpdate(this.update);
	}

	@action
	private update = () => {
		this.speed = mpsToKph(r3e.data.CarSpeed);
		this.sessionPhase = r3e.data.SessionPhase;
		this.drivers = this.getDrivers();
		this.controlType = r3e.data.ControlType;

		this.updateSounds();
	};

	private getDrivers = () => {
		const playerX = r3e.data.CarCgLocation.X * -1;
		const playerY = r3e.data.CarCgLocation.Z;

		const rotation = toDegrees(r3e.data.CarOrientation.Yaw * -1);

		return r3e.data.DriverData.filter((driver) => {
			return driver.DriverInfo.SlotId !== INVALID;
		})
			.filter((driver) => {
				return this.isCloseToPlayer(driver);
			})
			.map((driver) => {
				const opponentX = driver.Position.X * -1;
				const opponentY = driver.Position.Z;
				const isUser =
					driver.DriverInfo.SlotId === r3e.data!.VehicleInfo.SlotId;

				const distance = distance2d(
					playerX,
					playerY,
					opponentX,
					opponentY
				);

				const angle = this.getAngle(
					playerX,
					opponentX,
					playerY,
					opponentY,
					rotation
				);

				const data = {
					distance,
					isUser,
					angle,
					x: opponentX,
					y: opponentY,
					slot: driver.DriverInfo.SlotId,
					isClose: distance < this.closeDistance,
					name: base64ToString(driver.DriverInfo.Name),
					classPerformanceIndex:
						driver.DriverInfo.ClassPerformanceIndex
				};

				if (isUser) {
					this.driverPosition = data;
				}
				return data;
			});
	};

	private isCloseToPlayer(driver: IDriverData) {
		const playerX = r3e.data.CarCgLocation.X * -1;
		const playerY = r3e.data.CarCgLocation.Z;
		const opponentX = driver.Position.X * -1;
		const opponentY = driver.Position.Z;

		const distance = distance2d(playerX, playerY, opponentX, opponentY);

		return distance < this.closeDistance;
	}

	private getAngle(
		playerX: number,
		opponentX: number,
		playerY: number,
		opponentY: number,
		rotation: number
	) {
		return (
			((Math.atan2(opponentY - playerY, opponentX - playerX) * 180) /
				Math.PI +
				rotation +
				360 +
				90) %
			360
		);
	}

	private updateSounds() {
		// Reset
		this.warning.left.slot = INVALID;
		this.warning.right.slot = INVALID;

		this.drivers.forEach((driver) => {
			if (driver.isUser) {
				return;
			}

			const minLeftAngle = 215;
			const maxLeftAngle = 325;
			if (driver.angle > minLeftAngle && driver.angle < maxLeftAngle) {
				this.warning.left = {
					name: driver.name,
					slot: driver.slot,
					distance: driver.distance
				};
			}

			const minRightAngle = 35;
			const maxRightAngle = 145;
			if (driver.angle > minRightAngle && driver.angle < maxRightAngle) {
				this.warning.right = {
					name: driver.name,
					slot: driver.slot,
					distance: driver.distance
				};
			}
		});

		const hasCarOnLeft = this.warning.left.slot !== INVALID;
		const hasCarOnRight = this.warning.right.slot !== INVALID;
		const fastEnough = this.speed > this.minTriggerSpeed;

		if ((hasCarOnLeft || hasCarOnRight) && fastEnough) {
			const closestDistance = Math.min(
				this.warning.left.distance,
				this.warning.right.distance
			);

			const beepAmount = 1 - closestDistance / this.closeDistance;
			this.audio.volume = Math.max(0, Math.min(1, beepAmount * 0.1));

			const minPlaybackRate = 0.1;
			const maxPlaybackRate = 10;

			const playbackRateModifier = 2;
			this.audio.playbackRate = Math.min(
				Math.max(minPlaybackRate, beepAmount * playbackRateModifier),
				maxPlaybackRate
			);

			if (hasCarOnLeft && hasCarOnRight) {
				this.stereoPanner.pan.value = 0;
			} else if (hasCarOnLeft) {
				this.stereoPanner.pan.value = -1;
			} else if (hasCarOnRight) {
				this.stereoPanner.pan.value = 1;
			}

			if (
				this.controlType === EControl.Player &&
				!r3e.data.GameInMenus &&
				!r3e.data.GameInReplay &&
				this.props.settings.subSettings.shouldBeep.enabled &&
				this.audio.paused &&
				this.audioContext.state !== 'suspended' &&
				!this.audioIsPlaying
			) {
				// tslint:disable-next-line:no-empty
				this.audio.play().catch(() => {});
			}
		}
	}

	private getMapRotation() {
		const rotation = r3e.data.CarOrientation.Yaw * -1;
		return {
			transform: `rotate(${rotation}rad) translate(-50%, -50%)`
		};
	}

	private getDriverStyle(driver: IDriver) {
		if (!this.driverPosition) {
			return {
				top: 0,
				left: 0,
				opacity: 0,
				transform: ''
			};
		}
		const scale = this.scale;
		const playerX = this.driverPosition.x * scale;
		const playerY = this.driverPosition.y * scale;
		const containerWidth = 500;
		const containerHeight = 500;
		const left = driver.x * scale - playerX + containerWidth / 2;
		const top = driver.y * scale - playerY + containerHeight / 2;

		const rotation = r3e.data.CarOrientation.Yaw;
		const opacity = 1 - Math.min(1, driver.distance / 14);
		const transform = `rotate(${rotation}rad) translate(-50%, -50%)`;
		return {
			top,
			left,
			opacity,
			transform,
			background: getClassColor(driver.classPerformanceIndex)
		};
	}

	render() {
		return (
			<div
				{...widgetSettings(this.props)}
				className={classNames('spottingContainer', {
					shouldShow: !!this.drivers.length,
					danger:
						this.warning.left.slot !== INVALID ||
						this.warning.right.slot !== INVALID
				})}
			>
				{this.sessionPhase !== INVALID && (
					<div
						className={classNames(
							style.spotting,
							this.props.className
						)}
						style={{ ...this.getMapRotation() }}
					>
						{this.drivers.map((driver, i) => {
							return (
								<div
									key={`${driver.slot}-${i}`}
									style={{
										...this.getDriverStyle(driver)
									}}
									className={classNames('driver', {
										isUser: driver.isUser,
										isClose: driver.isClose
									})}
								/>
							);
						})}
					</div>
				)}
				<div
					className="warning left"
					style={{
						opacity: this.warning.left.slot !== INVALID ? 1 : 0
					}}
				/>
				<div
					className="warning right"
					style={{
						opacity: this.warning.right.slot !== INVALID ? 1 : 0
					}}
				/>
			</div>
		);
	}
}
