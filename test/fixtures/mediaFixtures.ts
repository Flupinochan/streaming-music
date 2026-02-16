export function mp3Fixture(): { data: Uint8Array; contentType: string } {
  return {
    data: new Uint8Array([0x49, 0x44, 0x33]),
    contentType: "audio/mpeg",
  } as const;
}

export function pngFixture(): { data: Uint8Array; contentType: string } {
  return {
    data: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
    contentType: "image/png",
  } as const;
}
