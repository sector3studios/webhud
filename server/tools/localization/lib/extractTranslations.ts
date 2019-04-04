import { extractTextPlugin, ITranslation } from './babelExtractTranslations';
import { SourceMapConsumer } from 'source-map';
import { transform } from 'babel-core';
import async from 'async';
import dive from 'dive';
import fs from 'fs';
import ts from 'typescript';

function fetchAndExtract(
	path: string,
	transpiles: ((done: Function) => void)[],
	translations: ITranslation[],
	useSourceMaps: boolean,
	done: () => void
) {
	dive(
		path,
		{
			directories: false,
			files: true,
			ignore: /node_modules/
		},
		(diveErr: Error, file: string) => {
			if (diveErr) {
				return console.error(`Could not traverse ${path}`);
			}

			// Ignore everything that isn't TypeScript (TS|TSX)
			if (!file.match(/\.tsx?$/) || file.indexOf('.d.ts') !== -1) {
				return;
			}

			transpiles.push((transpileDone) => {
				fs.readFile(file, (getFileErr: Error, buffer: Buffer) => {
					if (getFileErr) {
						return console.error(`Could not read file ${file}`);
					}

					const result = transpileTypeScript(buffer, useSourceMaps);

					extractTranslations(
						result,
						file,
						translations,
						transpileDone
					);
				});
			});
		},
		done
	);
}

function transpileTypeScript(buffer: Buffer, sourceMap = false) {
	const result = ts.transpileModule(buffer.toString(), {
		compilerOptions: {
			sourceMap,
			target: ts.ScriptTarget.ES5,
			module: ts.ModuleKind.CommonJS,
			jsx: ts.JsxEmit.React
		}
	});
	return result;
}

async function extractTranslations(
	result: ts.TranspileOutput,
	file: string,
	translations: ITranslation[],
	done: Function
) {
	let timeout: NodeJS.Timer;

	let smc: SourceMapConsumer | null = null;
	if (result.sourceMapText) {
		smc = await new SourceMapConsumer(
			JSON.parse(result.sourceMapText || '')
		);
	}

	if (!result.outputText) {
		return done();
	}

	transform(result.outputText, {
		presets: [require.resolve('babel-preset-es2015')],
		filename: file,
		plugins: [
			[
				extractTextPlugin,
				{
					smc,
					path: file,
					callback: (_err: Error, poData: ITranslation) => {
						if (poData && poData.msgid) {
							translations.push(poData);
						}

						// Small hack as the post hook doesn't seem to run
						if (timeout) {
							clearTimeout(timeout);
						}
						timeout = setTimeout(() => {
							done();
						}, 1);
					}
				}
			]
		]
	});
}

export function getTranslations(
	path: string,
	useSourceMaps = false
): Promise<ITranslation[]> {
	const transpiles: ((done: Function) => void)[] = [];

	// This is passed around and filled up
	const translations: ITranslation[] = [];

	const dives = [
		(done: () => void) => {
			fetchAndExtract(
				path,
				transpiles,
				translations,
				useSourceMaps,
				done
			);
		}
	];

	return new Promise((resolve, reject) => {
		async.parallel(dives, () => {
			async.parallel(transpiles, (err) => {
				if (err) {
					return reject(err);
				}
				resolve(translations);
			});
		});
	});
}
