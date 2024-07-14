# DEV NOTES

There are 3 types of links to be considered:

1. MD Links
2. HTML Links
3. Orphaned links (plain text URLs)
4. Relative links to other vault files

I'll only focus on 1 and 3 for now. Because those are the ones that can be turned into Obsidian Links.

ELH lets you configure which types of links to index in settings. I might do this later.

## Local Dev

1. Run `npm run dev`

## Releasing

Follow these steps: https://docs.obsidian.md/Plugins/Releasing/Release+your+plugin+with+GitHub+Actions

After adding the tag wait until the Github action runs and generates the main.js file before creating a new release. Might take a few minutes.

## TODO

* Check this error message: "emotion-react.browser.esm.js:435 You are loading @emotion/react when it is already loaded. Running multiple instances may cause problems. This can happen if multiple versions are used, or if multiple builds of the same version are used."

## Ideas for future

*  Show external links count on editor status bar 
* Command to replace external link with Obsidian Link
  * (If 4) Ability to let users customize the template for the generated Obsidian Link
