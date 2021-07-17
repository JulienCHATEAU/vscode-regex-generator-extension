// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { error } from 'console';
import * as vscode from 'vscode';
import { Regex } from './classes/regex';
import { getSelectedText } from './util/editor-util';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "regex_generator_interface" is now active!');
	console.log(getSelectedText())
	const provider = new ColorsViewProvider(context.extensionUri)
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(ColorsViewProvider.viewType, provider))

}

// this method is called when your extension is deactivated
export function deactivate() {}



class ColorsViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'regexGeneratorInterface';

	private _view?: vscode.WebviewView;

	private _regex?: Regex

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) {
		this._regex = new Regex()
	}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;
		this._regex = new Regex()

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(data => {
			try {
				switch (data.type) {
					case 'setLabel':
						{
							if (this._regex) {
								console.log(this._regex.toString())
								console.log(data)
								this._regex.setLabel(data.startIndex, data.endIndex, data.label)
								console.log(this._regex.toString())
							} else {
								console.error("regex is empty")
							}
							break;
						}
					case 'setText':
						{
							if (this._regex) {
								console.log(data.text)
								console.log(this._regex.toString())
								this._regex.initFrom(data.text)
								console.log(this._regex.toString())
							} else {
								console.error("regex is empty")
							}
							break;
						}
					case 'generate':
						{
							if (this._view && this._regex) {
								try {
									this._view.webview.postMessage({ type: 'generate', generatedRegex: this._regex.generate() });
								} catch (err) {
									console.error(err)
								}
							}
							break
						}
					case 'getSelectedText':
						{
							if (this._view) {
								this._view.webview.postMessage({ type: 'getSelectedText', selectedText: getSelectedText() });
							}
							break
						}
					case 'log':
						{
							console.log(data)
							break
						}
					case 'error':
						{
							console.error(data.message)
							break
						}
				}
			} catch (err) {
				console.error(err)
			}
		});
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		// Do the same for the stylesheet.
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();
		const text = getSelectedText()
		let title = "Please provide the text to work on :"
		let textSpans = `<input class="validateText" type="text"></input>`
		let inputTextBtn = `<button class="validateText">Validate text</button>`
		if (text !== "") {
			title = "Text you are working on :"
			inputTextBtn = ""
			textSpans = Array.from(text).map((char, index) => `<span class='character' id="e${index}">${(char===" ") ? "˽" : char}</span>`).join(" ")
			this._regex?.initFrom(text)
		}

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				
				<title>Cat Colors</title>
			</head>
			<body>
				<ul class="color-list">
				</ul>
				<p class="title">${title}</p>
				<p class="initialText" value="${text}">${textSpans}</p>
				<div class="validateText">${inputTextBtn}</div>

				<div class="generationTools">
					<div class="submenu">
						<span class="subtitles">Labels :</span>
						<div class="labels">
							<button class="commonLabel">Common</button>
							<button class="variableLabel">Variable</button>
							<button class="optionalLabel">Optional</button>
						</div>
					</div>

					<div class="submenu">
						<button class="validateLabel">Validate label</button>
						<button class="resetLabel">Reset labels</button>
						<button class="generateRegex">Generate regex</button>
					</div>

					<div class="submenu">
						<span class="subtitles">Generated find regex :</span>
						<p class="generatedFindRegex"></p>
					</div>
				</div>

				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}