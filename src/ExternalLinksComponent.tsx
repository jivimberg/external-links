import * as React from "react";
import {useEffect, useState} from "react";
import {ExternalLink} from "./ExternalLink";
import {App, TFile} from "obsidian";
import {Indexer} from "./Indexer";
import {TreeItem, TreeView} from "@mui/x-tree-view";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PublicIcon from '@mui/icons-material/Public';

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
			{externalLinks.map((el, index) => {
				const nodeId = `${activeFile?.path}-${index}`;
				return (
					<div className="tree-item-self">
						<PublicIcon className="tree-item-icon"/>
						<div className="tree-item-content">
							<a className="tree-item-inner" href={el.Url}>{el.Url}</a>
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
					defaultCollapseIcon={<ExpandMoreIcon />}
					defaultExpandIcon={<ChevronRightIcon />}
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
							.map((file) => {
									return fileRef(file);
								}
							)}
					</TreeItem>
				</TreeView>
			);

		}
	}

	function fileRef(file: TFile) {
		const folder = file.parent?.name;
		return (
			<TreeItem
				nodeId={file.path}
				className="leaf-tree-item"
				label={
					<div className="tree-item-self" onClick={() => props.app.workspace.getLeaf().openFile(file)}>
						<div className="tree-item-icon">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon lucide-link">
								<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
								<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
							</svg>
						</div>
						<div>
							<div className="tree-item-inner">{file.name}</div>
							{ folder ? <div className="tree-item-inner-subtext">{folder}</div> : null }
						</div>
					</div>
				}
			/>
		);
	}
};
