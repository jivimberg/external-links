import * as React from "react";
import {useEffect, useState} from "react";
import {ExternalLink} from "./ExternalLink";
import {App, TFile} from "obsidian";
import {Indexer} from "./Indexer";
import {TreeItem, TreeView} from "@mui/x-tree-view";

type ExternalLinksViewProps = {
	app: App;
	indexer: Indexer;
}

export const ExternalLinksComponent = (props: ExternalLinksViewProps) => {
	const [activeFile, setActiveFile] = useState<TFile | null>(props.app.workspace.getActiveFile());

	props.app.workspace.on("active-leaf-change", () => {
		setActiveFile(props.app.workspace.getActiveFile());
	});

	const [filePathToLinks, setFilePathToLinks] = useState<Map<string, ExternalLink[]>>(props.indexer.filePathToLinks);
	const [urlToFiles, setUrlToFiles] = useState<Map<string, Set<TFile>>>(props.indexer.urlToFiles);

	useEffect(() => {
		props.indexer.addListener((filePathToLinks, urlToFiles) => {
			console.log("Listener notified");
			// Need to create new map objects for useEffects to trigger
			setFilePathToLinks(new Map(filePathToLinks));
			setUrlToFiles(new Map(urlToFiles));
		});
	}, []);

	const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);

	useEffect(() => {
		if (activeFile === null) {
			setExternalLinks([]);
		} else {
			const links = filePathToLinks.get(activeFile.path) ?? [];
			setExternalLinks(links);
		}
	}, [activeFile, filePathToLinks, urlToFiles]);

	return (
		<div className="outgoing-link-pane">
			<div className="tree-item-self">
				<div className="tree-item-inner">External links</div>
				<div className="tree-item-flair-outer">
					<div className="tree-item-flair">{externalLinks.length}</div>
				</div>
			</div>
			<TreeView>
			{externalLinks.map((el, index) => {
				const nodeId = `${activeFile?.path}-${index}`;
				return (
					<TreeItem key={nodeId} nodeId={nodeId} label={ExternalLinkLabel(el)}>
						{Array.from(urlToFiles.get(el.Url) ?? [])
							.filter((file) => file.path !== activeFile?.path)
							.map((file) => {
									return (
										<TreeItem
											key={`${nodeId}-${file.name}`}
											nodeId={`${nodeId}-${file.name}`}
											label={RefListLabel(file)}
											className="ref-list"
										/>
									);
								}
							)}
					</TreeItem>
				);
			})}
			</TreeView>
		</div>
	);
};

function ExternalLinkLabel(el: ExternalLink) {
	return (
		<div>
			<div>{el.Text}</div>
			<div>
				<small>
					<a href={el.Url}>{el.Url}</a>
				</small>
			</div>
		</div>
	)
}


function RefListLabel(file: TFile) {
	return (
		<div key={file.path} className="ref-list-item">
			{file.basename}
		</div>
	);
}

