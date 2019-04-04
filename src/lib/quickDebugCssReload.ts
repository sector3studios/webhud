// Quick and dirty way to inject css changes immediately instead of waiting
// for webpack compile to finish. Images will currently fail since we don't
// deal with resolving assets

export default function quickDebugCssReload() {
	if (process.env.NODE_ENV === 'development') {
		const ws = new WebSocket(`ws://localhost:${process.env.PORT + 1}`);

		ws.addEventListener('message', (data) => {
			const css = data.data;

			const style = document.createElement('style');
			style.type = 'text/css';
			style.appendChild(document.createTextNode(css));

			if (document.head) {
				document.head.appendChild(style);
			}
			setTimeout(() => {
				if (style.parentNode) {
					style.parentNode.removeChild(style);
				}
			}, 3000);
		});
	}
}
