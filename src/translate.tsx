import { observable } from 'mobx';
import translations from './translations';

export type Locales = 'en' | 'de' | 'fr' | 'cn';

type TranslateArgument = string | number;
type TranslateArguments = ITranslateObject | TranslateArgument[];
interface ITranslateObject {
	[key: string]: TranslateArgument;
}

class LanguageStore {
	@observable
	language: Locales = 'en';

	translate = (text: string, _args?: TranslateArguments): string => {
		const modifiedText = translations[this.language][text] || text;
		return `${modifiedText}`;
	};

	setLocale = (locale: Locales) => {
		this.language = locale;
	};
	getLocale = () => {
		return this.language;
	};
	getTranslations = () => {
		return translations;
	};
}

const store = new LanguageStore();
export const setLocale = store.setLocale;
export const getLocale = store.getLocale;
export const getTranslations = store.getTranslations;
export const dynamicTranslate = (text: string, args?: TranslateArguments) => {
	return () => {
		return store.translate(text, args);
	};
};
export default store.translate;
