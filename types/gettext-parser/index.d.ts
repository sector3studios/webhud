interface IPoContent {
	charset: string;
	headers: IHeaders;
	translations: ITranslations;
}

interface IHeaders {
	language: string;
	'mime-version': string;
	'content-type': string;
	'content-transfer-encoding': string;
	'plural-forms': string;
}

interface ITranslations {
	'': IDefaultNamespace;
}

interface IDefaultNamespace {
	[msgid: string]: ITranslation;
}

interface ITranslation {
	msgid: string;
	comments: Comments;
	msgstr: string[];
}

interface Comments {
	extracted: string;
}

interface ICompileOptions {
	foldLength: number;
}

declare module 'gettext-parser' {
	export = gettext_parser;

	declare const gettext_parser: {
		po: {
			compile: (po: IPoContent, ICompileOptions) => Buffer;
			parse: (input: string | Buffer) => IPoContent;
		};
	};
}
