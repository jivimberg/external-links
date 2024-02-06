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
				console.log('modify event');
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
				plugin.app.vault.cachedRead(file as TFile).then((content) => {
					console.log('rename event');
					if (file instanceof TFile) {
						const links = scanFile(content, file);
						this.removeFileFromIndices(oldPath);
						this.addFileToIndices(file, links);
						this.notifyListeners();
					}
				})
			})
		)
		plugin.registerEvent(
			plugin.app.vault.on('delete', (file) => {
				console.log('delete event');
				if (file instanceof TFile) {
					this.removeFileFromIndices(file.path);
					this.notifyListeners();
				}
			})
		)
	}

	scanAllFiles = () => {
		this.plugin.app.vault.getMarkdownFiles().forEach((file) => {
			this.plugin.app.vault.cachedRead(file).then((content) => {
				const links = scanFile(content, file);
				this.addFileToIndices(file, links);
			});
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

const mdLinksRegex = /^\[([\w\s\d]+)]\((https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*))\)$/gm
const orphanedLinkRegex = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*))/gm

const scanFile = (content: string, file: TFile): ExternalLink[] => {
	const result: ExternalLink[] = [];

	const mdLinks = content.matchAll(mdLinksRegex);

	for (const mdLink of mdLinks) {
		result.push(new ExternalLink(mdLink[1], mdLink[2], file));
	}

	const orphanedLinks = content.matchAll(orphanedLinkRegex);

	for (const orphanedLink of orphanedLinks) {
		result.push(new ExternalLink(orphanedLink[1], orphanedLink[1], file));
	}

	return result;
}
