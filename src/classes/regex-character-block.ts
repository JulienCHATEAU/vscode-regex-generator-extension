import { RegexLabel } from "../enums/regex-label"
import { escapeRegExp } from "../util/regex-util"
import { RegexCharacter } from "./regex-character"

export class RegexCharacterBlock {

  private _block: RegexCharacter[]

  constructor() {
    this._block = []
  }

  public push(char: RegexCharacter) {
    this._block.push(char)
  }

  public generate() {
    let res = ""
    switch (this.label) {
      case RegexLabel.COMMON:
        res = `(${this.str})`
        break;

      case RegexLabel.VARIABLE:
        res = `(.*)`
        break;

      case RegexLabel.OPTIONAL:
        res = `(${this.str})?`
        break;
    }
    return res
  }

  public toString(): string {
    return this._block.join("_")
  }

  public get str(): string {
    return escapeRegExp(this._block.map(c => c.char).join("")).replace(/˽/g, " ")
  }

  public get label(): RegexLabel | undefined {
     return (this._block.length === 0) ? undefined : this._block[0].label
  }

  public get block(): RegexCharacter[] {
    return this._block
  }

  public set block(value: RegexCharacter[]) {
    this._block = value
  }

}