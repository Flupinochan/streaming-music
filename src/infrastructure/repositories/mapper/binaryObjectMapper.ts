import { BinaryObject } from "@/domain/entities/binaryObject";
import { BinaryObjectDto } from "../dto/binaryObjectDto";

// Entity to DTO
export const binaryObjectToBinaryObjectDto = (
  entity: BinaryObject,
): BinaryObjectDto => {
  return new BinaryObjectDto(
    entity.data,
    entity.size,
    entity.type,
    entity.name,
  );
};

// DTO to Entity
export const binaryObjectDtoToBinaryObject = (
  dto: BinaryObjectDto,
): BinaryObject => {
  return BinaryObject.create(dto.data, dto.contentType, dto.originalFilename);
};

// DTO to plain object
export const binaryObjectDtoToPlainObject = (dto: BinaryObjectDto): object => ({
  data: dto.data,
  byteLength: dto.byteLength,
  contentType: dto.contentType,
  originalFilename: dto.originalFilename,
});

// Entity to plain object
export const binaryObjectToPlainObject = (entity: BinaryObject): object => ({
  data: entity.data,
  byteLength: entity.size,
  contentType: entity.type,
  originalFilename: entity.name,
});
