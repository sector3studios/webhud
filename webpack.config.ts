import { Client as Sentry } from 'sentry-api';
import { execSync } from 'child_process';
import { LoaderContext } from './types/webpack-extras';
import { tmpdir } from 'os';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import config from './config.json';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import fs from 'fs';
import HappyPack from 'happypack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import merge from 'webpack-merge';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import path from 'path';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import webpack from 'webpack';
import WebpackOnBuildPlugin from 'on-build-webpack';

interface ICommit {
	id: string;
	author_name: string;
	author_email: string;
	timestamp: string;
	message: string;
}

const coreCount = 4;

const entries = {
	index: './src/index'
};

const tsConfigPath = path.resolve(__dirname, 'src', 'tsconfig.json');

const tsLoaderRule = {
	test: /\.(tsx?|jsx?)$/,
	include: path.resolve('src'),
	loaders: ['happypack/loader?id=ts']
};

const cssLoader = {
	loader: 'css-loader',
	options: {
		modules: true,
		sourceMap: true,
		getLocalIdent: (
			_context: LoaderContext,
			_localIdentName: string,
			localName: string
		) => {
			return localName;
		}
	}
};

const sassLoader = {
	loader: 'sass-loader',
	options: {
		javascriptEnabled: true,
		sourceMap: true
	}
};

function getReleaseId() {
	try {
		return execSync('git rev-parse HEAD')
			.toString()
			.substr(0, 10);
	} catch (e) {
		return `missing-git-${Date.now()}`;
	}
}

function getGitCommits(commit: string, forceHead?: boolean): ICommit[] {
	const split = '☃';
	const range = forceHead ? 'HEAD' : `${commit}..HEAD`;
	const cmd = `git log ${range} --pretty=format:%h%n%an%n%ae%n%ai%n%s%n${split}`;
	try {
		const commits = execSync(cmd)
			.toString()
			.split(split)
			.filter(Boolean)
			.map((line) => {
				const parts = line.trim().split('\n');
				return {
					id: parts[0],
					author_name: parts[1],
					author_email: parts[2],
					timestamp: new Date(parts[3]).toISOString(),
					message: parts.slice(4).join('\n')
				};
			});

		return commits;
	} catch (e) {
		// If it fails with forceHead just return nothing.
		if (forceHead) {
			return [];
		}

		return getGitCommits('', true);
	}
}

const commonConfig: webpack.Configuration = {
	output: {
		path: path.resolve('dist')
	},
	node: {
		__dirname: false,
		__filename: false
	},
	resolve: {
		extensions: ['.js', '.ts', '.jsx', '.tsx', '.scss']
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				enforce: 'pre',
				loader: 'tslint-loader'
			},
			{
				test: /\.(wav|ogg|cur|ttf|woff|ico|png|jpe?g|gif)$/,
				loaders: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[hash].[ext]',
							outputPath: 'files/'
						}
					}
				]
			},
			{
				test: /\.svg$/,
				loader: 'svg-inline-loader?classPrefix'
			}
		]
	}
};

const hotreloadConfig: webpack.Configuration = {
	mode: 'development',
	output: {
		filename: 'bundle.js',
		pathinfo: false,
		publicPath: '/'
	},
	devtool: 'inline-source-map',
	entry: [
		`webpack-dev-server/client?http://0.0.0.0:${config.PORT}`,
		'webpack/hot/dev-server',
		'./src/index'
	],
	module: {
		rules: [
			tsLoaderRule,
			{
				test: /\.scss$/,
				loaders: ['style-loader', cssLoader, sassLoader]
			}
		]
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.DefinePlugin({
			'process.env.ANALYTICS_KEY': `'${
				config.ANALYTICS_KEY.DEVELOPMENT
			}'`,
			'process.env.NODE_ENV': `'${config.ENV.DEVELOPMENT}'`,
			'process.env.PORT': `${config.PORT}`,
			'process.env.SENTRY_DSN': `'${config.SENTRY_DSN.DEVELOPMENT}'`,
			'process.env.SHARED_MEMORY_VERSION_MAJOR': `${
				config.SHARED_MEMORY_VERSION_MAJOR
			}`,
			'process.env.SHARED_MEMORY_VERSION_MINOR': `${
				config.SHARED_MEMORY_VERSION_MINOR
			}`,
			'process.env.RELEASE': `"${config.RELEASE_ID.DEVELOPMENT}"`
		}),
		new HappyPack({
			id: 'ts',
			threads: coreCount,
			loaders: [
				{
					loader: 'ts-loader',
					options: {
						transpileOnly: true,
						experimentalWatchApi: true,
						configFile: tsConfigPath,
						happyPackMode: true,
						compilerOptions: {
							noUnusedLocals: false,
							noUnusedParameters: false
						}
					}
				}
			]
		}),
		new HtmlWebpackPlugin({
			title: `Dev - ${config.PROJECT.NAME}`,
			filename: 'index.html',
			template: 'src/templates/main.ejs',
			favicon: 'src/img/favicon.ico'
		}),
		new ForkTsCheckerWebpackPlugin({
			workers: 1,
			checkSyntacticErrors: true,
			tsconfig: tsConfigPath
		})
	]
};

const productionConfig: webpack.Configuration = {
	mode: 'production',
	output: {
		filename: 'bundle.[name].[hash].js',
		chunkFilename: 'bundle.[name].[hash].js',
		sourceMapFilename: 'bundle.[hash].[chunkhash].js.map'
	},
	stats: {
		hash: false,
		version: false,
		timings: true,
		assets: false,
		chunks: false,
		modules: false,
		reasons: false,
		children: false,
		source: false,
		errors: true,
		errorDetails: true,
		warnings: false,
		publicPath: false,
		builtAt: false,
		entrypoints: false,
		colors: false
	},
	devtool: 'source-map',
	entry: entries,
	optimization: {
		splitChunks: {
			cacheGroups: {
				vendor: {
					chunks: 'initial',
					name: 'vendor',
					test: 'vendor',
					enforce: true
				}
			}
		},
		minimizer: [
			new UglifyJsPlugin({
				cache: tmpdir() + '/uglifyjs-webpack-plugin',
				sourceMap: true,
				parallel: coreCount,
				uglifyOptions: {
					ecma: 8,
					toplevel: true,
					compress: {
						drop_console: true
					}
				}
			})
		]
	},
	module: {
		rules: [
			tsLoaderRule,
			{
				test: /\.scss$/,
				loaders: [
					{
						loader: MiniCssExtractPlugin.loader as string
					},
					cssLoader,
					sassLoader
				]
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.ANALYTICS_KEY': `'${config.ANALYTICS_KEY.PRODUCTION}'`,
			'process.env.NODE_ENV': `'${config.ENV.PRODUCTION}'`,
			'process.env.PORT': `${config.PORT}`,
			'process.env.SENTRY_DSN': `'${config.SENTRY_DSN.PRODUCTION}'`,
			'process.env.SHARED_MEMORY_VERSION_MAJOR': `${
				config.SHARED_MEMORY_VERSION_MAJOR
			}`,
			'process.env.SHARED_MEMORY_VERSION_MINOR': `${
				config.SHARED_MEMORY_VERSION_MINOR
			}`,
			'process.env.RELEASE': `"${getReleaseId()}"`
		}),
		new CleanWebpackPlugin(),
		new MiniCssExtractPlugin({
			filename: 'bundle.[name].[hash].css'
		}),
		new HappyPack({
			id: 'ts',
			threads: coreCount,
			loaders: [
				{
					loader: 'ts-loader',
					options: {
						transpileOnly: false,
						experimentalWatchApi: true,
						configFile: tsConfigPath,
						happyPackMode: true,
						compilerOptions: {
							noUnusedLocals: false,
							noUnusedParameters: false
						}
					}
				}
			]
		}),
		new webpack.optimize.ModuleConcatenationPlugin(),
		new webpack.optimize.OccurrenceOrderPlugin(true),
		new webpack.optimize.AggressiveMergingPlugin(),
		new OptimizeCssAssetsPlugin(),
		...Object.keys(entries).map((chunk) => {
			return new HtmlWebpackPlugin({
				title: `${config.PROJECT.NAME} - ${chunk}`,
				template: 'src/templates/main.ejs',
				chunks: ['vendor', chunk],
				favicon: 'src/img/favicon.ico',
				filename: `${chunk}.html`
			});
		}),
		new WebpackOnBuildPlugin(async (_stats: webpack.Stats) => {
			copyOverPublicFiles();

			createSentryRelease();
		})
	]
};

function copyOverPublicFiles() {
	const files = fs.readdirSync('./public/');
	files.forEach((file) => {
		console.log('Copying', file);
		fs.writeFileSync(`./dist/${file}`, fs.readFileSync(`./public/${file}`));
	});
}

async function createSentryRelease() {
	const token = (config.SENTRY_API_TOKEN || '').trim();
	if (!token || token.match(/XXXXXXXXXX/)) {
		console.log(
			'Skipping https://sentry.io release because token is missing.'
		);
		return;
	}

	// Create a sentry release based on build
	const newReleaseId = getReleaseId();

	const sentry = new Sentry({
		token
	});

	const organization = config.PROJECT.SENTRY_ORGANIZATION;
	const project = config.PROJECT.SENTRY_PROJECT_NAME;
	const previousReleases = await sentry.projects.releases(
		organization,
		project
	);

	const lastReleaseId = previousReleases[0]
		? previousReleases[0].version
		: '';

	const commits = getGitCommits(lastReleaseId);
	if (lastReleaseId === newReleaseId) {
		console.log(`\nSentry is already up to date on ${lastReleaseId}`);
		return;
	}

	const newRelease = await sentry.releases.create(organization, project, {
		commits,
		version: newReleaseId
	});

	const releaseUrl = `https://sentry.io/${organization}/${project}/releases/`;
	console.log(`\nReleased: ${releaseUrl}${newRelease.shortVersion}/`);

	const filesToUpload = fs
		.readdirSync(`${__dirname}/dist/`)
		.filter((filename) => filename.match(/\.js(\.map)?$/));

	// Add files to the release.
	filesToUpload.forEach(async (file) => {
		const newFile = await sentry.releases.createFile(
			organization,
			project,
			newReleaseId,
			{
				name: '~/' + file,
				file: fs.createReadStream(`${__dirname}/dist/${file}`)
			}
		);
		console.log('Uploaded file:', newFile.name);
	});
}

export default function(env: string) {
	if (env === 'production') {
		console.log('Using production configuration');
		process.env.NODE_ENV = 'production';
		return merge(commonConfig, productionConfig);
	}

	console.log('Using hotreload configuration');
	process.env.NODE_ENV = 'development';
	return merge(commonConfig, hotreloadConfig);
}
