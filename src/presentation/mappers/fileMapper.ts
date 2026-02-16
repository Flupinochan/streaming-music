import type { BinaryObjectDto } from "@/presentation/dto/binaryObjectDto";

export const fileToBinaryObjectDto = async (
  file: File,
): Promise<BinaryObjectDto> => {
  const data = await file.arrayBuffer();
  return {
    data,
    byteLength: data.byteLength,
    contentType: file.type,
    originalFilename: file.name,
  };
};
