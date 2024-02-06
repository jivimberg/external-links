import * as React from "react";
import {ExternalLink} from "./ExternalLink";
import {useEffect, useState} from "react";
import {App, TFile} from "obsidian";
import {Indexer} from "./Indexer";

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
			<div className="tree-item-self is-clickable">
				<div className="tree-item-inner">External links</div>
				<div className="tree-item-flair-outer">
					<div className="tree-item-flair">{externalLinks.length}</div>
				</div>
			</div>
			<div className="search-result-container">
				{externalLinks.map((el) => {
					return (
						<div key={`${el.Text}${el.Url}${el.File.path}`} className="tree-item-self is-clickable outgoing-link-item">
							<div>
								<span className="tree-item-icon">
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon lucide-link">
									<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
									<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
								</svg>
								</span>
								<div className="tree-item-inner">{el.Text}</div>
							</div>
							<div>
								<small className="tree-item-inner">
									<a href={el.Url}>{el.Url}</a>
								</small>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
