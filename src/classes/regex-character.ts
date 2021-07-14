import { RegexLabel } from "../enums/regex-label"

export class RegexCharacter {

  private _char: string
  private _label: RegexLabel
  

  constructor(char: string, label: RegexLabel = RegexLabel.COMMON) {
    this._char = char
    this._label = label
  }

  public toString(): string {
    return `${this._label}{${this._char}}`
  }

  public get char(): string {
    return this._char
  }

  public set char(value: string) {
    this._char = value
  }

  public get label(): RegexLabel {
    return this._label
  }
  
  public set label(value: RegexLabel) {
    this._label = value
  }

}