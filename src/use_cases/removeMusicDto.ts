export class RemoveMusicDto {
  constructor(
    public readonly id: string,
    public readonly musicDataPath: string,
    public readonly artworkImagePath: string,
  ) {}
}
