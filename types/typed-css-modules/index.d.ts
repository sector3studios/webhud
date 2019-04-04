export default typed_css_modules;

export interface IDtsContent {
	formatted: string;
	writeFile: () => void;
}
declare class typed_css_modules {
	constructor(options?: {});
	create(filePath: string, initialContents: string): Promise<IDtsContent>;
}
