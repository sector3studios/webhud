import {
	SourceMapConsumer,
	Position,
	NullableMappedPosition
} from 'source-map';
import { CallExpression, MemberExpression } from 'babel-types';
import { NodePath } from 'babel-traverse';

export interface ITranslation {
	msgid: string;
	msgid_plural?: string;
	callLocation: Position;
	comments: string[];
	callSites: (Position | NullableMappedPosition)[];
}
export interface IPlugin {
	opts: {
		smc: SourceMapConsumer;
		path: string;
		callback(err: Error | null, value?: ITranslation): void;
	};
}

const visitor = {
	// tslint:disable-next-line:naming-convention
	CallExpression(nodePath: NodePath<CallExpression>, plugin: IPlugin) {
		const functionNames = {
			translate_1: ['msgid', 'arguments']
		};
		if (nodePath.node.callee.type !== 'MemberExpression') {
			return plugin.opts.callback(null);
		}

		const callee = nodePath.node.callee;
		if (!shouldVisitNode(functionNames, callee)) {
			return plugin.opts.callback(null);
		}
		const functionName = getFunctionName(functionNames, callee);
		const translate: ITranslation = {
			msgid: '',
			callLocation: {
				line: 0,
				column: 0
			},
			comments: [],
			callSites: []
		};

		const args = nodePath.get('arguments');
		const l = Array.isArray(args) ? args.length : 1;
		const smc = plugin.opts.smc;

		for (let i = 0; i < l; i++) {
			const name = functionName[i];
			const arg = args[i].evaluate();
			const value = arg.value;

			const confidentWithValue = arg.confident && value;
			if (confidentWithValue && name === 'msgid') {
				translate[name] = value;
				translate.comments.push(`${plugin.opts.path}`);
				translate.callLocation = callee.loc.start;

				// Set a default call with no arguments in case the
				// following arguments part is never triggered in
				// the babel traversal.
				translate.callSites.push(
					getCallSiteKey(smc, translate.callLocation)
				);
			}
		}
		plugin.opts.callback(null, translate);
	}
};

function getCallSiteKey(smc: SourceMapConsumer, loc: Position) {
	if (smc) {
		return smc.originalPositionFor(loc);
	}

	return loc;
}

function getFunctionName(functionNames: {}, callee: MemberExpression) {
	if (callee.object.type === 'Identifier') {
		const object = callee.object;
		const functionName = functionNames[object.name];
		return functionName;
	}
	throw new Error('Failed trying to getFunctionName');
}

function shouldVisitNode(functionNames: {}, callee: MemberExpression) {
	if (callee.object.type === 'Identifier') {
		const object = callee.object;
		const shouldVisit = object && functionNames.hasOwnProperty(object.name);

		return shouldVisit;
	}
	return false;
}

export function extractTextPlugin() {
	return {
		visitor
	};
}
