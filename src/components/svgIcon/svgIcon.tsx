import { classNames } from '../../lib/utils';
import { observer } from 'mobx-react';
import React from 'react';
import style from './svgIcon.scss';

interface IProps
	extends React.HTMLAttributes<HTMLImageElement | HTMLDivElement> {
	src: string;
	className?: string;
}

@observer
export default class SvgIcon extends React.Component<IProps, {}> {
	constructor(props: IProps) {
		super(props);
	}

	render() {
		return (
			<div
				{...this.props}
				className={classNames(style.svgIcon, this.props.className)}
				// tslint:disable-next-line:jsx-ban-props
				dangerouslySetInnerHTML={{
					__html: this.props.src
				}}
			/>
		);
	}
}
