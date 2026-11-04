import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
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
  @IsOptional() @IsUUID() closure_id?: string;
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
  @IsOptional() @IsUUID() closure_id?: string;
  @IsUUID() device_id!: string;
  @IsInt() @Min(1) @Max(2147483647) sequence!: number;
  @IsInt() @Min(0) @Max(2147483647) pending!: number;
  @IsInt() @Min(0) @Max(2147483647) failed!: number;
  @IsBoolean() complete!: boolean;
}

export class CloseSessionDto {
  @IsUUID() request_id!: string;
  @IsString() @MinLength(1) @MaxLength(1000) @Matches(/\S/) reason!: string;
}

// Bounded transport for a frozen legacy inventory; normal visits still use /end.
export class EndSessionPartDto {
  @IsUUID() closure_id!: string;
  @IsUUID() device_id!: string;
  @IsDateString() ended_at!: string;
  @IsInt() @Min(0) @Max(2147483647) allocated_count!: number;
  @IsInt() @Min(10001) @Max(2147483647) inventory_size!: number;
  @IsInt() @Min(0) @Max(2147483647) offset!: number;
  @IsArray()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => InventoryEntry)
  observations!: InventoryEntry[];
}
