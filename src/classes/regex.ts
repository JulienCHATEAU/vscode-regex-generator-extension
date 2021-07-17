import { RegexLabel } from "../enums/regex-label"
import { RegexCharacter } from "./regex-character"
import * as vscode from 'vscode';
import { RegexCharacterBlock } from "./regex-character-block";

export class Regex {

  private _initialText: string;
  private _regex: RegexCharacter[]
  private _regexBlocks: RegexCharacterBlock[]

  constructor(initialText: string = "") {
    this._initialText = ""
    this._regex = []
    this._regexBlocks = []
    this.initFrom(initialText)
  }

  public initFrom(text: string) {
    this._initialText = text.replace(/ /g, "˽")
    this._regex = []
    for (const char of this._initialText) {
      const regexChar = new RegexCharacter(char)
      this._regex.push(regexChar)
    }
  }

  public setLabelBySelection(selection: vscode.Selection, label: RegexLabel) {
    this.setLabel(selection.start.character - 1, selection.end.character - 1, label)
  }

  public setLabel(startIndex: number, endIndex: number, label: RegexLabel) {
    if (startIndex === -1) {
      startIndex = 0
      endIndex = this.initialText.length
    }
    for (let i = startIndex; i <= endIndex; i++) {
      this._regex[i].label = label
    }
  }

  private initRegexBlocks() {
    let currBlock = new RegexCharacterBlock()
    let currLabel = this._regex[0].label
    for (let i = 0; i < this._regex.length; i++) {
      const element = this._regex[i];
      if (element.label !== currLabel) {
        this._regexBlocks.push(currBlock)
        currBlock = new RegexCharacterBlock()
        currLabel = element.label
      }
      currBlock.push(element)
    }
    this._regexBlocks.push(currBlock)
  }

  public generate(): string {
    console.log(this.initialText)
    this.initRegexBlocks()
    let res = ""
    for (const block of this._regexBlocks) {
      res += block.generate()
    }
    this._regexBlocks = []
    return res
  }

  public toString(): string {
    return this._regex.map(char => char.toString()).join(" ")
  }

  public get initialText(): string {
    return this._initialText;
  }
  public set initialText(value: string) {
    this._initialText = value;

  }

}