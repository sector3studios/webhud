import fs from 'node';

interface IOptions {
	recursive?: boolean;
	all?: boolean;
	directories?: boolean;
	files?: boolean;
	ignore?: boolean | RegExp;
}
declare module 'dive' {
	declare function dive(
		directory: string,
		options: IOptions,
		action: (error: Error, file: string, stat: fs.Stats) => void,
		complete?: () => void
	): void;
	export = dive;
}
