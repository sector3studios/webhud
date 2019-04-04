import { action, observable } from 'mobx';
import { classNames, INVALID } from './../../lib/utils';
import { get, isObject } from 'lodash-es';
import { observer } from 'mobx-react';
import _ from './../../translate';
import r3e, { registerUpdate, unregisterUpdate } from '../../lib/r3e';
import React from 'react';
import style from './graphs.scss';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
	opacity: number;
}

interface ITrackedData {
	min: number;
	max: number;
	avg: number;
	total: number;
	data: number[];
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
}

interface IGraphsListEntry {
	path: string;
	name: string;
	depth: number;
}

@observer
export default class Graphs extends React.Component<IProps, {}> {
	@observable
	sessionType = INVALID;

	@observable
	selectedkeys: string[] = [];

	@observable
	editing = false;

	@observable
	statTrackingCount = 0;

	container = React.createRef<HTMLDivElement>();

	trackedData: { [key: string]: ITrackedData } = {};

	canvasWidth = 300;
	canvasHeight = 50;
	maxDataPoints = this.canvasWidth;

	empty = 'None';

	ignore = /DriverData|Unused|Id$|Name/i;

	constructor(props: IProps) {
		super(props);

		registerUpdate(this.update);
	}

	componentWillUnmount() {
		window.removeEventListener('keypress', this.onKeyPress);
		unregisterUpdate(this.update);
	}

	componentDidMount() {
		window.addEventListener('keypress', this.onKeyPress);
		if (localStorage.graphSelectedKeys) {
			const keys = JSON.parse(localStorage.graphSelectedKeys);
			this.selectedkeys = keys;
			keys.forEach((path: string) => {
				this.track(path);
			});
		}
	}

	private onKeyPress = (e: KeyboardEvent) => {
		if (e.key === 'c') {
			this.reset();
		}
	};

	private formatNumber(num: number) {
		try {
			return num.toString().match(/-?(.*\.0*\d{0,2}|^-?\d*$)/)![0];
		} catch (e) {
			return `BROKEN: ${num}`;
		}
	}

	private approxRollingAverage(avg: number, newSample: number, n: number) {
		let der = avg - avg / n;
		der += newSample / n;
		return der;
	}

	@action
	private update = () => {
		const paths = Object.keys(this.trackedData);
		this.statTrackingCount = paths.length;
		paths.forEach((path) => {
			const tracker = this.trackedData[path];
			const newValue = get(r3e.data, path);
			tracker.data.push(newValue);
			tracker.total += 1;

			if (tracker.data.length > this.maxDataPoints) {
				tracker.data = tracker.data.slice(1);
			}

			tracker.min = Math.min(newValue, tracker.min);
			tracker.max = Math.max(newValue, tracker.max);
			tracker.avg = this.approxRollingAverage(
				tracker.avg,
				newValue,
				tracker.total
			);

			tracker.total += 1;

			const sectionWidth = this.canvasWidth / this.maxDataPoints;
			tracker.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

			tracker.ctx.shadowColor = 'rgba(0,0,0,1)';
			tracker.ctx.shadowOffsetX = 2;
			tracker.ctx.shadowOffsetY = 2;
			tracker.ctx.shadowBlur = 1;

			tracker.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
			tracker.ctx.lineWidth = 1;
			tracker.ctx.lineJoin = 'round';
			tracker.ctx.lineCap = 'round';
			tracker.ctx.fillStyle = '#fff';

			tracker.ctx.textBaseline = 'top';
			tracker.ctx.font = 'bold 12px Arial';
			const formatedValue = this.formatNumber(
				tracker.data[tracker.data.length - 1]
			);

			tracker.data.forEach((value, i) => {
				const x = sectionWidth * i;
				const startY = this.normalizeValue(value, tracker);
				const endY = this.normalizeValue(
					tracker.data[i - 1] || value,
					tracker
				);

				tracker.ctx.beginPath();
				tracker.ctx.moveTo(x, startY);
				tracker.ctx.lineTo(x - 1, endY);
				tracker.ctx.stroke();
			});

			const pathParts = path.split('.');
			const shortPath = pathParts.slice(-2).join('.');
			// Title
			tracker.ctx.textAlign = 'start';
			tracker.ctx.fillStyle = '#ffa';
			tracker.ctx.fillText(`${shortPath}: ${formatedValue}`, 10, 10);
			tracker.ctx.fillStyle = '#fff';

			// Min
			tracker.ctx.textBaseline = 'bottom';
			tracker.ctx.fillText(
				`Min: ${this.formatNumber(
					tracker.min
				)}, Max: ${this.formatNumber(
					tracker.max
				)}, Avg: ${this.formatNumber(tracker.avg)}`,
				10,
				this.canvasHeight - 10
			);
		});
	};

	@action
	private toggleEditing = () => {
		this.editing = !this.editing;
	};

	@action
	private onChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const values = [].filter
			.call(e.target.options, (o: HTMLOptionElement) => o.selected)
			.map((o: HTMLOptionElement) => o.value);
		this.clear();
		values.forEach((path) => {
			this.track(path);
		});

		this.selectedkeys = values;
		localStorage.graphSelectedKeys = JSON.stringify(values);
	};

	private normalizeValue(value: number, tracker: ITrackedData) {
		const range = tracker.max - tracker.min;
		const normalizedValue =
			this.canvasHeight -
			((value - tracker.min) / range) * this.canvasHeight;
		return normalizedValue;
	}

	private getAllPaths() {
		const paths: IGraphsListEntry[] = [];

		const traverse = (data: Object, subPath = '', depth: number) => {
			if (depth > 1) {
				return;
			}
			Object.keys(data).forEach((key) => {
				const value = data[key];

				if (typeof value === 'number') {
					paths.push({
						depth,
						path: `${subPath}.${key}`,
						name: `${key}`
					});
				} else if (isObject(value)) {
					paths.push({
						depth,
						path: `${subPath}.${key}`,
						name: `${key}`
					});
					traverse(value, `${subPath}.${key}`, depth + 1);
				}
			});
		};

		traverse(r3e.data, '', 0);
		return paths
			.map((path) => {
				path.path = path.path.replace(/^\./, '');
				return path;
			})
			.filter((path) => {
				return !path.path.match(this.ignore);
			})
			.sort((a, b) => {
				return a.path.localeCompare(b.path);
			});
	}

	private clear = () => {
		if (this.container.current) {
			this.container.current.innerHTML = '';
		}
		this.trackedData = {};
	};

	private reset = () => {
		this.clear();

		this.selectedkeys.forEach((path) => {
			this.track(path);
		});
	};

	@action
	private clearTracking = () => {
		if (this.container.current) {
			this.container.current.innerHTML = '';
		}
		this.trackedData = {};

		this.selectedkeys = [];
		delete localStorage.graphSelectedKeys;

		this.editing = false;
	};

	private track = (path: string) => {
		if (path === this.empty) {
			return;
		}
		const value = get(r3e.data, path);
		if (isObject(value)) {
			Object.keys(value).forEach((key) => {
				const subPath = `${path}.${key}`;
				this.track(subPath);
			});
		} else if (typeof value === 'number') {
			this.createPath(path);
		} else {
			console.error(
				`Could not add ${path} because value is ${typeof value}`
			);
		}
	};
	private createPath(path: string) {
		if (this.trackedData[path] || path.match(this.ignore)) {
			return;
		}

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = this.canvasWidth;
		canvas.height = this.canvasHeight;

		this.trackedData[path] = {
			canvas,
			ctx: ctx as CanvasRenderingContext2D,
			min: Number.MAX_SAFE_INTEGER,
			max: 0,
			avg: 0,
			total: 0,
			data: []
		};

		if (!this.container.current) {
			console.error('Tried to mount on non existing container');
			return;
		}

		this.container.current.appendChild(canvas);
	}

	render() {
		return (
			<div
				className={classNames(style.graphs, this.props.className, {
					hasTracking: this.statTrackingCount !== 0,
					wide: this.statTrackingCount > 36,
					wider: this.statTrackingCount > 54,
					widest: this.statTrackingCount > 72
				})}
			>
				<div
					className="canvases"
					ref={this.container}
					onClick={this.toggleEditing}
				/>
				{this.editing && (
					<select
						className="selection"
						onChange={this.onChangeSelect}
						multiple={true}
					>
						{this.getAllPaths().map((entry) => {
							return (
								<option
									key={entry.path}
									selected={
										this.selectedkeys.indexOf(
											entry.path
										) !== INVALID
									}
									className={`depth-${entry.depth}`}
									value={entry.path}
								>
									{entry.name || this.empty}
								</option>
							);
						})}
					</select>
				)}
				{this.editing && (
					<div
						className="closeSelection"
						onClick={this.toggleEditing}
					>
						{_('Close')}
					</div>
				)}
				{this.editing && (
					<div
						className="clearSelection"
						onClick={this.clearTracking}
					>
						{_('Clear')}
					</div>
				)}
				<div
					style={{
						opacity: this.props.opacity
					}}
					className="toggleEdit"
					onClick={this.toggleEditing}
				>
					{this.editing ? 'Close selection' : 'Telemetry'}
				</div>
				{this.statTrackingCount !== 0 && (
					<div className="reset" onClick={this.reset}>
						{_('Reset values (c)')}
					</div>
				)}
			</div>
		);
	}
}
