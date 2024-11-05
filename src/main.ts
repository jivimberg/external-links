import {Plugin, WorkspaceLeaf} from 'obsidian';
import {ExternalLinksView, VIEW_TYPE_EXTERNAL_LINK_VIEW} from "./view";
import {Indexer} from "./Indexer";

export default class ExternalLinksPlugin extends Plugin {

	indexer: Indexer;

	async onload() {
		this.indexer = new Indexer(this);

		this.app.workspace.onLayoutReady(() => {
			return this.indexer.scanAllFiles();
		});

		this.registerView(
			VIEW_TYPE_EXTERNAL_LINK_VIEW,
			(leaf) => new ExternalLinksView(leaf, this)
		);

		this.addCommand({
			id: 'show-external-links',
			name: 'Show external links',
			callback: () => {
				this.activateView();
			},
		});
	}

	onUserEnable() {
		this.activateView();
	}

	async activateView() {
		await this.app.workspace.ensureSideLeaf(VIEW_TYPE_EXTERNAL_LINK_VIEW, 'right');
	}
}
