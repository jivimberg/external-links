import {ExternalLink} from "./ExternalLink";
import {TFile} from "obsidian";
import ExternalLinksPlugin from "./main";

export class Indexer {

	public filePathToLinks: Map<string, ExternalLink[]> = new Map<string, ExternalLink[]>();
	public urlToFiles: Map<string, Set<TFile>> = new Map<string, Set<TFile>>();
	private listeners: ((filePathToLinks: Map<string, ExternalLink[]>, urlToFiles: Map<string, Set<TFile>>) => void)[] = [];

	constructor(
		public plugin: ExternalLinksPlugin,
	) {
		plugin.registerEvent(
			plugin.app.vault.on('modify', (file) => {
				if (file instanceof TFile) {
					// Read the file and update the link indices
					plugin.app.vault.cachedRead(file).then((content) => {
						const links = scanFile(content, file);
						this.removeFileFromIndices(file.path);
						this.addFileToIndices(file, links);
						this.notifyListeners();
					})
				}
			})
		)
		plugin.registerEvent(
			plugin.app.vault.on('rename', (file, oldPath) => {
				if (file instanceof TFile) {
					plugin.app.vault.cachedRead(file).then((content) => {
						const links = scanFile(content, file);
						this.removeFileFromIndices(oldPath);
						this.addFileToIndices(file, links);
						this.notifyListeners();
					})
				}
			})
		)
		plugin.registerEvent(
			plugin.app.vault.on('delete', (file) => {
				if (file instanceof TFile) {
					this.removeFileFromIndices(file.path);
					this.notifyListeners();
				}
			})
		)
	}

	scanAllFiles = () => {
		const promises: Promise<void>[] = this.plugin.app.vault.getMarkdownFiles()
			.map(async (file) => {
				const content = await this.plugin.app.vault.cachedRead(file);
				const links = scanFile(content, file);
				this.addFileToIndices(file, links);
			});

		Promise.all(promises).then(() => {
			this.notifyListeners();
		});
	}

	removeFileFromIndices = (filePath: string) => {
		// remove file from urlToFiles map
		const oldLinksOnFile = this.filePathToLinks.get(filePath) ?? [];
		for (const link of oldLinksOnFile) {
			const files = this.urlToFiles.get(link.Url);
			if (!files) continue;

			for (const file of files) {
				if (file.path == filePath) {
					files?.delete(file);
				}
			}
		}

		// remove file from filePathToLinks map
		this.filePathToLinks.delete(filePath);
	}

	addFileToIndices = (file: TFile, links: ExternalLink[]) => {
		// dedupe links
		links = links.filter((link, index, self) => self.findIndex(l => l.Url === link.Url) === index);

		// Add the new links to the urlToFiles map
		for (const link of links) {
			if (!this.urlToFiles.has(link.Url)) {
				this.urlToFiles.set(link.Url, new Set<TFile>());
			}
			this.urlToFiles.get(link.Url)?.add(file);
		}

		// Add the new links to the filePathToLinks map
		this.filePathToLinks.set(file.path, links);
	}

	addListener(listener: (filePathToLinks: Map<string, ExternalLink[]>, urlToFiles: Map<string, Set<TFile>>) => void) {
		this.listeners.push(listener);
	}

	private notifyListeners() {
		for (const listener of this.listeners) {
			listener(this.filePathToLinks, this.urlToFiles);
		}
	}
}

const mdLinksRegex = /\[([^[]+)]\((https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*))\)/gm
const orphanedLinkRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gm
const filePathRegex = /file:\/\/[-a-zA-Z0-9@:%._+~#=/]{1,256}/gm

export const scanFile = (content: string, file: TFile): ExternalLink[] => {
	const result: ExternalLink[] = [];

	// Find all markdown links
	const mdLinks = content.matchAll(mdLinksRegex);
	for (const mdLink of mdLinks) {
		result.push(new ExternalLink(mdLink[1], mdLink[2], file));
	}

	// Find all orphaned links
	const orphanedLinks = content.matchAll(orphanedLinkRegex);
	for (const orphanedLink of orphanedLinks) {
		// Filtering markdown links. Has to be done this way because Apple does not support negative lookbehind regex
		const index = orphanedLink.index;
		if (index !== undefined && index > 1) {
			const precedingChars = content.slice(index - 2, index);
			if (precedingChars === "](") {
				// This is a markdown link, ignore it
				continue;
			}
		}

		result.push(new ExternalLink(orphanedLink[0], orphanedLink[0], file));
	}

	// Find all file links
	const fileLinks = content.matchAll(filePathRegex);
	for (const fileLink of fileLinks) {
		result.push(new ExternalLink(fileLink[0], fileLink[0], file));
	}

	return result;
}
