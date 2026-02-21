export class Seconds {
  private constructor(private readonly _value: number) {}

  static createFromSeconds(value: number): Seconds {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error("Seconds must be a finite number >= 0");
    }
    return new Seconds(value);
  }

  get value(): number {
    return this._value;
  }

  getLabel(): string {
    const minutes = Math.floor(this._value / 60);
    const seconds = Math.floor(this._value % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  toString(): string {
    return String(this._value);
  }
}
