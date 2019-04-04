import { getTranslations } from './lib/extractTranslations';
import { syncTranslations } from './lib/syncTranslations';
import fs from 'fs';
import gettextParser from 'gettext-parser';
import path from 'path';
import sortObject from 'sort-keys-recursive';

const translationsPath = path.resolve(__dirname + '/../../../src/');
console.log(`Gathering phrases from: ${translationsPath}`);

(async () => {
	let translations;
	try {
		translations = await getTranslations(translationsPath, true);
	} catch (e) {
		const errorMessage = JSON.stringify({
			error: e.toString()
		});

		return console.log(errorMessage);
	}

	const duplicatesCheck: { [key: string]: ITranslation } = {};
	const root = path.resolve(`${__dirname}/../../../`);
	translations.forEach((translation) => {
		const msgid = translation.msgid;

		const file = translation.comments[0]
			.replace(root, '.')
			.replace(/\\/g, '/');

		const line = translation.callSites[0].line;
		const column = translation.callSites[0].line;
		let comment = `${file}`;

		if (line !== null && column !== null) {
			comment = `${file}:${line}:${column}`;
			const fileContent = fs
				.readFileSync(`${__dirname}/../../../${file}`)
				.toString()
				.split('\n');

			// Add additional context to translations
			comment += `\n${(fileContent[line - 2] || '').trim()}`;
			comment += `\n${(fileContent[line - 1] || '').trim()}`;
			comment += `\n${(fileContent[line] || '').trim()}`;
		}

		if (duplicatesCheck[msgid]) {
			const comments = duplicatesCheck[msgid].comments;

			const tmpExtracted = comments.extracted.split('\n');
			tmpExtracted.push(comment);

			comments.extracted = tmpExtracted.sort().join('\n');
			return;
		}

		const translateUnit: ITranslation = {
			msgid: translation.msgid,
			comments: {
				extracted: comment || ''
			},
			msgstr: [translation.msgid]
		};
		duplicatesCheck[msgid] = translateUnit;
	});
	const sortedObj = sortObject(duplicatesCheck);

	const poContent = gettextParser.po
		.compile(
			{
				charset: 'utf-8',
				headers: {
					language: 'en',
					'mime-version': '1.0',
					'content-type': 'text/plain; charset=UTF-8',
					'content-transfer-encoding': '8bit',
					'plural-forms': 'nplurals=2; plural=(n != 1);'
				},
				translations: {
					'': sortedObj
				}
			},
			{
				foldLength: 512
			}
		)
		.toString();

	const basePath = path.resolve(`${root}/src/translations/en/en.po`);
	fs.writeFileSync(basePath, poContent);
	console.log(`Saved: ${basePath}`);

	await syncTranslations(translationsPath);
})();
