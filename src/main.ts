import {Plugin, WorkspaceLeaf} from 'obsidian';
import {ExternalLinksView, VIEW_TYPE_EXTERNAL_LINK_VIEW} from "./view";
import {Indexer} from "./Indexer";

export default class ExternalLinksPlugin extends Plugin {

	indexer: Indexer;

	async onload() {
		console.log('loading plugin');
		this.indexer = new Indexer(this);
		this.indexer.scanAllFiles()

		this.registerView(
			VIEW_TYPE_EXTERNAL_LINK_VIEW,
			(leaf) => new ExternalLinksView(leaf, this)
		);

		this.addRibbonIcon("dice", "Activate view", () => {
			this.activateView();
		});
	}

	onunload() {

	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_EXTERNAL_LINK_VIEW);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);
			await leaf.setViewState({ type: VIEW_TYPE_EXTERNAL_LINK_VIEW, active: true });
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		workspace.revealLeaf(leaf);
	}

}
