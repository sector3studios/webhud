declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: string;
			RELEASE: string;
			ANALYTICS_KEY: string;
			PORT: number;
			SENTRY_DSN: string;
		}
	}
}

export {};
