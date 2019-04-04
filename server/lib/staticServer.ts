import { Server } from 'http';
import fs from 'fs';
import mime from 'mime';
import path from 'path';
import url from 'url';

type Listener = (...args: any[]) => void;

// Serve static files so we can test production builds in hot-reload mode
export function staticServer(httpServer: Server) {
	const listeners = httpServer.listeners('request');

	listeners.forEach((listener) => {
		httpServer.removeListener('request', listener as Listener);

		httpServer.on('request', (req, res) => {
			const pathname = url.parse(req.url).pathname;
			const filePath = path.resolve(`${__dirname}/../dist/${pathname}`);

			fs.readFile(filePath, (err, data) => {
				// If we can't find file in /dist/ fallback to webpack
				if (err) {
					return listener(req, res);
				}

				res.setHeader('Content-type', mime.getType(filePath));
				res.end(data);
			});
		});
	});
}
