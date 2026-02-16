export class BinaryObjectDto {
  public readonly data: ArrayBuffer;
  public readonly byteLength: number;
  public readonly contentType: string;
  public readonly originalFilename: string;

  constructor(
    data: ArrayBuffer,
    byteLength: number,
    contentType: string,
    originalFilename: string,
  ) {
    this.data = data;
    this.byteLength = byteLength;
    this.contentType = contentType;
    this.originalFilename = originalFilename;
  }
}
