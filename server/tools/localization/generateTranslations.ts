import dive from 'dive';
import fs from 'fs';
import gettextParser from 'gettext-parser';
import path from 'path';
import sortObject from 'sort-keys-recursive';

interface ILanguageEntry {
	[msgid: string]: string;
}

console.log('Generating translations...');

const poFiles: string[] = [];
const translations: { [key: string]: ILanguageEntry } = {};

const srcPath = path.resolve(__dirname + '/../../../src/');
const translationsPath = path.resolve(`${srcPath}/translations`);

const diveOptions = {
	directories: false,
	files: true,
	ignore: /node_modules/
};

const addPoFile = (diveErr: Error, filePath: string) => {
	if (diveErr) {
		throw diveErr;
	}

	if (filePath.match(/\.po$/)) {
		poFiles.push(filePath);
	}
};

const generateTsFile = () => {
	poFiles.forEach((filePath) => {
		// en, sv etc...
		const languageKey = path.basename(path.dirname(filePath));
		const currentLanguage: ILanguageEntry = (translations[
			languageKey
		] = {});

		const poContent = gettextParser.po.parse(
			fs.readFileSync(filePath).toString()
		);

		const defaultNamespace = poContent.translations[''];
		Object.keys(defaultNamespace).forEach((msgid) => {
			if (!msgid) {
				return;
			}

			const translation = defaultNamespace[msgid];
			currentLanguage[msgid] = translation.msgstr.join('\n');
		});
	});

	const formattedOutput = JSON.stringify(sortObject(translations), null, '	');

	const tsFileContent = [
		`// tslint:disable:max-line-length`,
		`// tslint:disable:quotemark`,
		`// tslint:disable:object-literal-key-quotes`,
		`const translations = ${formattedOutput};`,
		`export default translations;`,
		``
	].join('\n');

	const outputPath = `${srcPath}/translations.ts`;
	console.log(`Saved: ${outputPath}`);
	fs.writeFileSync(outputPath, tsFileContent);
};

dive(translationsPath, diveOptions, addPoFile, generateTsFile);
