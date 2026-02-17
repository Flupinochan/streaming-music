export class BinaryObjectDto {
  constructor(
    public readonly data: ArrayBuffer,
    public readonly byteLength: number,
    public readonly contentType: string,
    public readonly originalFilename: string,
  ) {}
}
