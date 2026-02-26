/**
 * Base class for music paths ensuring they start with "music/".
 */
export class MusicPath {
  protected readonly value: string;

  constructor(path: string) {
    if (!path.startsWith("music/")) throw new Error("Invalid music path");
    this.value = path;
  }

  toString(): string {
    return this.value;
  }
}
