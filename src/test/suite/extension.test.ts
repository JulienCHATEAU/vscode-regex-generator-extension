import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { Regex } from '../../classes/regex';
import { RegexLabel } from '../../enums/regex-label';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('should initialize regex correctly', () => {
		const regex = new Regex("@Column() _title: string")
		assert.strictEqual(regex.toString(), "C{@} C{C} C{o} C{l} C{u} C{m} C{n} C{(} C{)} C{ } C{_} C{t} C{i} C{t} C{l} C{e} C{:} C{ } C{s} C{t} C{r} C{i} C{n} C{g}")
	})

	test('should execute a common label setting correctly', () => {
		const regex = new Regex("@Column() _title: string")
		const selection = new vscode.Selection(new vscode.Position(1, 12), new vscode.Position(1, 17))
		regex.setLabelBySelection(selection, RegexLabel.VARIABLE)
		assert.strictEqual(regex.toString(), "C{@} C{C} C{o} C{l} C{u} C{m} C{n} C{(} C{)} C{ } C{_} V{t} V{i} V{t} V{l} V{e} C{:} C{ } C{s} C{t} C{r} C{i} C{n} C{g}")
	})

	test('should execute an interlacing label setting correctly', () => {
		const regex = new Regex("@Column() _title: string")
		const selection = new vscode.Selection(new vscode.Position(1, 12), new vscode.Position(1, 17))
		regex.setLabelBySelection(selection, RegexLabel.VARIABLE)
		const selection2 = new vscode.Selection(new vscode.Position(1, 7), new vscode.Position(1, 15))
		regex.setLabelBySelection(selection2, RegexLabel.OPTIONAL)
		assert.strictEqual(regex.toString(), "C{@} C{C} C{o} C{l} C{u} C{m} O{n} O{(} O{)} O{ } O{_} O{t} O{i} O{t} V{l} V{e} C{:} C{ } C{s} C{t} C{r} C{i} C{n} C{g}")
	})

	// test('should throw an exception if substr was not found', () => {
	// 	const regex = new Regex("@Column() _title: string")
	// 	assert.throws(() => {
	// 		regex.setLabelBySelection("notinthetext", RegexLabel.VARIABLE)
	// 	})
	// 	assert.strictEqual(regex.toString(), "C{@} C{C} C{o} C{l} C{u} C{m} C{n} C{(} C{)} C{ } C{_} C{t} C{i} C{t} C{l} C{e} C{:} C{ } C{s} C{t} C{r} C{i} C{n} C{g}")
	// })
	
});