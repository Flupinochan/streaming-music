export class TrackId {
  private constructor(private readonly value: string) {}

  static create(value: string): TrackId {
    if (value.trim() === "") {
      throw new Error("TrackId must be a non-empty string");
    }
    return new TrackId(value);
  }

  toString(): string {
    return this.value;
  }
}
