// S3に保存する音楽や画像データなどのバイナリデータ
export class BinaryObject {
  protected constructor(
    public readonly data: ArrayBuffer,
    public readonly size: number,
    public readonly type: string,
    public readonly name: string,
  ) {
    if (!type) {
      throw new Error("MIME type is required");
    }
    if (data.byteLength === 0) {
      throw new Error("Data cannot be empty");
    }

    this.data = data;
    this.size = size;
    this.type = type;
    this.name = name;
  }

  public static create(
    data: ArrayBuffer,
    type: string,
    name: string,
  ): BinaryObject {
    return new BinaryObject(data, data.byteLength, type, name);
  }

  public static async fromFile(file: File): Promise<BinaryObject> {
    const data = await file.arrayBuffer();
    return this.create(data, file.type, file.name);
  }

  public toBlob(): Blob {
    return new Blob([this.data], { type: this.type });
  }

  public isAudio(): boolean {
    return this.type.startsWith("audio/");
  }

  public isImage(): boolean {
    return this.type.startsWith("image/");
  }
}
