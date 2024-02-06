import {TFile} from "obsidian";

export class ExternalLink {
	constructor(
		public Text: string,
		public Url: string,
		public File: TFile
	) {}
}
