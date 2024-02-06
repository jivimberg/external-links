import {ItemView, WorkspaceLeaf} from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {createRoot} from "react-dom/client";
import ExternalLinksPlugin from "./main";
import {ExternalLinksComponent} from "./ExternalLinksComponent";

export const VIEW_TYPE_EXTERNAL_LINK_VIEW = "external-links-view";

export class ExternalLinksView extends ItemView {

	constructor(leaf: WorkspaceLeaf, public plugin: ExternalLinksPlugin) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_EXTERNAL_LINK_VIEW;
	}

	getDisplayText() {
		return "External Links"
	}

	async onOpen() {
		const root = createRoot(this.containerEl.children[1]);
		root.render(
			<React.StrictMode>
				<ExternalLinksComponent
					app={this.plugin.app}
					indexer={this.plugin.indexer}
				/>
			</React.StrictMode>
		);
	}

	async onClose() {
		ReactDOM.unmountComponentAtNode(this.containerEl);
	}
}
