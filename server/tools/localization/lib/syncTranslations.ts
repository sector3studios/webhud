import async from 'async';
import dive from 'dive';
import fs from 'fs';
import gettextParser from 'gettext-parser';
import path from 'path';
import sortObject from 'sort-keys-recursive';

const diveOptions = {
	directories: false,
	files: true,
	ignore: /node_modules/
};
export const syncTranslations = (translationDir: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		let savePath: string | undefined;

		if (!translationDir) {
			reject(
				new Error('Did not supply valid directory for translations')
			);
		}

		const dirFiles: string[] = [];

		const addPoFiles = (diveErr: Error, file: string) => {
			if (diveErr) {
				throw diveErr;
			}
			if (file.match(/\.po$/)) {
				dirFiles.push(file);
			}
		};

		const finishedFetchingFiles:
			| async.AsyncResultObjectCallback<{}, {}>
			| undefined = (err, fileBuffers) => {
			if (err) {
				throw err;
			}

			const englishPoFile = fileBuffers['en'] as Buffer;
			if (!englishPoFile) {
				throw new Error(`Missing 'en' locale.`);
			}

			const fromPoData = gettextParser.po.parse(englishPoFile);

			// We only want to sync the no english translations
			delete fileBuffers.en;

			Object.keys(fileBuffers).forEach((languageKey) => {
				const toPoData = gettextParser.po.parse(
					fileBuffers[languageKey]!.toString()
				);

				copyHeaders(languageKey, fromPoData, toPoData);

				// Sync missing translations
				Object.keys(fromPoData.translations['']).forEach((msgid) => {
					syncMissingTranslation(
						msgid,
						fromPoData,
						toPoData,
						languageKey
					);
				});

				// Copy over comments and remove old phrases
				syncTranslation(fromPoData, toPoData);

				// Sort data for more predictable diffing
				toPoData.translations = sortObject(toPoData.translations);

				const toSavePath = path.resolve(
					`${savePath}/${languageKey}/${languageKey}.po`
				);
				const poContent = gettextParser.po
					.compile(toPoData, {
						foldLength: 512
					})
					.toString();

				fs.writeFile(toSavePath, poContent, () => {
					console.log(`Saved: ${toSavePath}`);
				});
			});

			resolve();
		};

		const finishedTraversing = () => {
			savePath = getSavePath(dirFiles);
			if (!savePath) {
				throw new Error('Did not find save path.');
			}

			async.parallel(
				generateFileFetchingTasks(dirFiles),
				finishedFetchingFiles
			);
		};

		dive(translationDir, diveOptions, addPoFiles, finishedTraversing);
	});
};

const generateFileFetchingTasks = (files: string[]) => {
	const fetchFileTasks = {};

	files.forEach((file) => {
		const languageKey = path.basename(path.dirname(file));
		fetchFileTasks[languageKey] = (
			done: (err: Error, data: Buffer) => void
		) => {
			fs.readFile(file, done);
		};
	});

	return fetchFileTasks;
};

const getSavePath = (files: string[]): string | undefined => {
	const savePaths = files
		.filter((file) => file.match(/(\\|\/)en(\\|\/)/))
		.map((file) => path.dirname(path.dirname(file)));

	return savePaths[0];
};

const syncMissingTranslation = (
	msgid: string,
	from: IPoContent,
	to: IPoContent,
	languageKey: string
) => {
	if (!to.translations['']) {
		to.translations[''] = {};
	}

	if (
		(!to.translations[''][msgid] ||
			!to.translations[''][msgid].msgstr ||
			!to.translations[''][msgid].msgstr[0].trim()) &&
		msgid.length
	) {
		if (!to.translations[''][msgid]) {
			console.log(`Synced en > ${languageKey}: "${msgid}"`);
		}

		const copy = JSON.parse(JSON.stringify(from.translations[''][msgid]));
		copy.msgstr = [''];
		to.translations[''][msgid] = copy;
	}
};

const syncTranslation = (fromPoData: IPoContent, toPoData: IPoContent) => {
	const from = fromPoData.translations[''];
	const to = toPoData.translations[''];

	Object.keys(to).forEach((msgid) => {
		const deletedFromMainFile = !from[msgid];
		const presetInTranslation = to[msgid];
		if (deletedFromMainFile) {
			console.error(`Deleted ${msgid}`);

			// tslint:disable-next-line:no-dynamic-delete
			delete to[msgid];
		} else if (presetInTranslation) {
			to[msgid].comments = from[msgid].comments;
		}
	});
};

const copyHeaders = (
	language: string,
	fromPoData: IPoContent,
	toPoData: IPoContent
) => {
	toPoData.headers = JSON.parse(JSON.stringify(fromPoData.headers));
	toPoData.headers.language = language;
};
