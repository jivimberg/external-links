import * as React from "react";
import {useEffect, useState} from "react";
import {ExternalLink} from "./ExternalLink";
import {Plugin, TFile} from "obsidian";
import {Indexer} from "./Indexer";
import {TreeItem, TreeView} from "@mui/x-tree-view";
import {ChevronDown, ChevronRight, Earth, Link2} from "lucide-react";

type ExternalLinksViewProps = {
	plugin: Plugin;
	indexer: Indexer;
}

export const ExternalLinksComponent = (props: ExternalLinksViewProps) => {
	const app = props.plugin.app;
	const [activeFile, setActiveFile] = useState<TFile | null>(app.workspace.getActiveFile());

	props.plugin.registerEvent(app.workspace.on("active-leaf-change", () => {
		setActiveFile(app.workspace.getActiveFile());
	}));

	const [filePathToLinks, setFilePathToLinks] = useState<Map<string, ExternalLink[]>>(props.indexer.filePathToLinks);
	const [urlToFiles, setUrlToFiles] = useState<Map<string, Set<TFile>>>(props.indexer.urlToFiles);

	useEffect(() => {
		props.indexer.addListener((filePathToLinks, urlToFiles) => {
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
		<div>
			<div className="tree-item-self external-links-header">
				<div className="tree-item-inner">External links</div>
				<div className="tree-item-flair-outer">
					<div className="tree-item-flair">{externalLinks.length}</div>
				</div>
			</div>
			{externalLinks.map((el, index) => {
				const nodeId = `${activeFile?.path}-${index}`;
				return (
					<div key={nodeId} className="tree-item-self">
						<Link2 className="tree-item-icon"/>
						<div className="tree-item-content">
							<a className="tree-item-inner" href={el.Url}>{el.Text}</a>
							{refList(nodeId, urlToFiles.get(el.Url), activeFile)}
						</div>
					</div>
				);
			})}
		</div>
	);

	function refList(
		nodeId: string,
		refList: Set<TFile> | undefined,
		activeFile: TFile | null
	) {
		const filteredRefList = Array.from(refList ?? [])
			.filter((file) => file.path !== activeFile?.path);

		if (filteredRefList.length === 0) {
			return;
		} else {
			return (
				// Make it gray on collapsed, white when open
				<TreeView
					defaultCollapseIcon={<ChevronRight />}
					defaultExpandIcon={<ChevronDown />}
				>
					<TreeItem
						key={nodeId}
						nodeId={nodeId}
						className="tree-item-inner-subtext"
						label={
							<small>
								Found in {filteredRefList.length} other note{filteredRefList.length > 1 ? "s" : ""}
							</small>
						}
					>
						{ filteredRefList
							.map((file) => fileRef(nodeId, file))
						}
					</TreeItem>
				</TreeView>
			);

		}
	}

	function fileRef(parentNodeId: string, file: TFile) {
		const folder = file.parent?.path;
		const nodeId = `${parentNodeId} | ${file.path}`;
		return (
			<TreeItem
				key={nodeId}
				nodeId={nodeId}
				className="leaf-tree-item"
				label={
					<div className="tree-item-self" onClick={() => app.workspace.getLeaf().openFile(file)}>
						<div className="tree-item-icon">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon lucide-link">
								<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
								<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
							</svg>
						</div>
						<div>
							<div className="tree-item-inner">{file.basename}</div>
							{ folder ? <div className="tree-item-inner-subtext">{folder}</div> : null }
						</div>
					</div>
				}
			/>
		);
	}
};
