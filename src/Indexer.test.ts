import {TFile} from "obsidian";
import {ExternalLink} from "lucide-react";
import {scanFile} from "./Indexer";
import {describe, expect, test} from '@jest/globals';

// Indexer.test.ts
jest.mock('obsidian');

describe('scanFile', () => {

	test('should return markdown links', () => {
		const content = 'This is a test content with a markdown link [example](http://example.com)';
		const result = scanFile(content, new TFile());
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(1);
		expect(result[0].Url).toBe('http://example.com');
	});

	test('should return orphaned links', () => {
		const content = 'This is a test content with an orphaned link http://orphanedlink.com';
		const result = scanFile(content, new TFile());
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(1);
		expect(result[0].Url).toBe('http://orphanedlink.com');
	});

	test('should return file links', () => {
		const content = 'This is a test content with a file link [file](file://filelink)';
		const result = scanFile(content, new TFile());
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(1);
		expect(result[0].Url).toBe('file://filelink');
	});

	test('should recognize all three types of links at once', () => {
		const content = 'This is a test content with a markdown link [example](http://example.com), an orphaned link http://orphanedlink.com, and a file link [file](file://filelink)';
		const result = scanFile(content, new TFile());
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(3);
		expect(result[0].Url).toBe('http://example.com');
		expect(result[1].Url).toBe('http://orphanedlink.com');
		expect(result[2].Url).toBe('file://filelink');
	});

	test('should index a link multiple times even if it has the same URL and same markdown text', () => {
		const content = 'This is a test content with two identical links [example](http://example.com) and [example](http://example.com)';
		const result = scanFile(content, new TFile());
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(2);
		expect(result[0].Url).toBe('http://example.com');
	});


	test('should return an empty array when content is empty', () => {
		const content = '';
		const result = scanFile(content, new TFile());
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(0);
	});

	test('should return an empty array when content has no links', () => {
		const content = 'This is a test content with no links';
		const result = scanFile(content, new TFile());
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(0);
	});

	test('should ignore invalid links', () => {
		const content = 'This is a test content with an invalid link http://';
		const result = scanFile(content, new TFile());
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(0);
	});

	test('should not include non-http(s) links', () => {
		const content = 'This is a test content with a non-http link ftp://example.com';
		const result = scanFile(content, new TFile());
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(0);
	});

	test('should include links in code blocks', () => {
		const content = 'This is a test content with a link in a code block `http://example.com`';
		const result = scanFile(content, new TFile());
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(1);
		expect(result[0].Url).toBe('http://example.com');
	});

	test('should handle links in comments correctly', () => {
		const content = 'This is a test content with a link in a comment <!-- http://example.com -->';
		const result = scanFile(content, new TFile());
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(1);
		expect(result[0].Url).toBe('http://example.com');
	});

	test('should not include relative links', () => {
		const content = 'This is a test content with a relative link [relative](/relative/path)';
		const result = scanFile(content, new TFile());
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(0);
	});

	test('should handle links in HTML code correctly', () => {
		const content = 'This is a test content with a link in HTML code <a href="http://example.com">example</a>';
		const result = scanFile(content, new TFile());
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(1);
		expect(result[0].Url).toBe('http://example.com');
	});
});
