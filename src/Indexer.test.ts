import {TFile} from "obsidian";
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

	test('should return valid Windows file path links', () => {
		const content = 'file://C:/Users/Test/Documents/file.txt';
		const result = scanFile(content, new TFile());
		expect(result).toHaveLength(1);
		expect(result[0].Url).toBe('file://C:/Users/Test/Documents/file.txt');
	});

	test('should return valid Unix file path links', () => {
		const content = 'file:///home/user/documents/file.txt';
		const result = scanFile(content, new TFile());
		expect(result).toHaveLength(1);
		expect(result[0].Url).toBe('file:///home/user/documents/file.txt');
	});

	test('should handle file links with special characters', () => {
		const content = 'file:///path/with/special-chars-!@#$%^&()_+=.txt';
		const result = scanFile(content, new TFile());
		expect(result).toHaveLength(1);
		expect(result[0].Url).toBe('file:///path/with/special-chars-!@#$%^&()_+=.txt');
	});

	test('should handle deeply nested directories', () => {
		const content = 'file:///very/deeply/nested/directory/structure/file.txt';
		const result = scanFile(content, new TFile());
		expect(result).toHaveLength(1);
		expect(result[0].Url).toBe('file:///very/deeply/nested/directory/structure/file.txt');
	});

	test('should handle file paths without extensions', () => {
		const content = 'file:///path/to/file';
		const result = scanFile(content, new TFile());
		expect(result).toHaveLength(1);
		expect(result[0].Url).toBe('file:///path/to/file');
	});

	test('should correctly handle file links wrapped in parentheses', () => {
		const content = 'Here is a file link [file](file:///path/to/file.txt)';
		const result = scanFile(content, new TFile());
		expect(result).toHaveLength(1);
		expect(result[0].Url).toBe('file:///path/to/file.txt');
	});

	test('should ignore invalid file links', () => {
		const content = 'file://';
		const result = scanFile(content, new TFile());
		expect(result).toHaveLength(0);
	});

	test('should correctly handle multiple file links', () => {
		const content = 'file:///first/path/file1.txt and file:///second/path/file2.pdf';
		const result = scanFile(content, new TFile());
		expect(result).toHaveLength(2);
		expect(result[0].Url).toBe('file:///first/path/file1.txt');
		expect(result[1].Url).toBe('file:///second/path/file2.pdf');
	});

	test('should handle file links with commas in the file name', () => {
		const content = 'file:///path/to/file,name,with,commas.pdf';
		const result = scanFile(content, new TFile());
		expect(result).toHaveLength(1);
		expect(result[0].Url).toBe('file:///path/to/file,name,with,commas.pdf');
	});

	test('should not recognize URLs with unknown protocols such as ftp', () => {
		const content = 'http://example.com ftp://example.com file:///valid/path/file.txt';
		const result = scanFile(content, new TFile());
		expect(result).toHaveLength(2);
		expect(result[0].Url).toBe('http://example.com');
		expect(result[1].Url).toBe('file:///valid/path/file.txt');
	});

	test('should correctly parse content with valid and invalid links', () => {
		const content = 'file:///valid/path/file.txt udp://invalidlink file:///another/valid/file.pdf';
		const result = scanFile(content, new TFile());
		expect(result).toHaveLength(2);
		expect(result[0].Url).toBe('file:///valid/path/file.txt');
		expect(result[1].Url).toBe('file:///another/valid/file.pdf');
	});
});
