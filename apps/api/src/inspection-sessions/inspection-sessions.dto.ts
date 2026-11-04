import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
export class RegisterSessionDto {
  @IsUUID() client_uuid!: string;
  @IsUUID() project_id!: string;
  @IsUUID() device_id!: string;
  @IsDateString() started_at!: string;
}
export class InventoryEntry {
  @IsUUID() client_uuid!: string;
  @IsInt() @Min(1) @Max(2147483647) observation_number!: number;
  @IsUUID() photo_client_uuid!: string;
  @IsIn(['saved', 'deleted']) disposition!: 'saved' | 'deleted';
}
export class EndSessionDto {
  @IsUUID() device_id!: string;
  @IsDateString() ended_at!: string;
  @IsInt() @Min(0) @Max(2147483647) allocated_count!: number;
  @IsArray()
  @ArrayMaxSize(10000)
  @ValidateNested({ each: true })
  @Type(() => InventoryEntry)
  observations!: InventoryEntry[];
}
export class SessionSyncDto {
  @IsUUID() device_id!: string;
  @IsInt() @Min(1) @Max(2147483647) sequence!: number;
  @IsInt() @Min(0) @Max(2147483647) pending!: number;
  @IsInt() @Min(0) @Max(2147483647) failed!: number;
  @IsBoolean() complete!: boolean;
}
