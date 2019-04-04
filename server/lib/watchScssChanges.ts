import chokidar from 'chokidar';
import DtsCreator from 'typed-css-modules';
import fs from 'fs';
import sass from 'node-sass';
import WebSocket from 'ws';

const dtsCreator = new DtsCreator();

// Watch for changes with .scss files and generate .d.ts files
export function generateScssTypingsAndBroadcastChange(port: number) {
	const wss = new WebSocket.Server({ port: port + 1 });

	chokidar
		.watch(`${__dirname}/../../src`, {
			ignoreInitial: true
		})
		.on('all', async(eventType, path) => {
			const beingRemoved = eventType === 'unlink';
			const notScssFile = !path.match(/\.scss$/);

			if (beingRemoved || notScssFile) {
				return;
			}

			const sassContent = fs.readFileSync(path).toString();

			sass.render(
				{
					data: sassContent
				},
				(err, result) => {
					if (err) {
						return console.error(err);
					}

					// Strip urls since we don't do file resolving with
					// this quick SCSS changes
					const finalCss = result.css
						.toString()
						.replace(/url\(/g, '_url(');

					wss.clients.forEach((client) => {
						client.send(finalCss);
					});
				}
			);

			const typings = await dtsCreator.create(path, sassContent);
			const output = typings.formatted;

			// Only write d.ts if the typings have changed, otherwise
			// it will invalidate everything and takes longer to compile.
			fs.readFile(path + '.d.ts', (e, content) => {
				if (e) {
					return typings.writeFile();
				}
				if (output.trim() !== content.toString().trim()) {
					typings.writeFile();
				}
			});
		});
}
