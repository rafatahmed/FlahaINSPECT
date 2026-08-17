import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

export class SyncTelemetryEventDto {
  @IsString()
  type!: string;

  @IsOptional()
  @IsUUID()
  client_uuid?: string;

  @IsOptional()
  @IsString()
  captured_at?: string;

  @IsOptional()
  @IsString()
  synced_at?: string;

  @IsOptional()
  @IsString()
  error?: string;
}

export class SyncTelemetryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncTelemetryEventDto)
  events!: SyncTelemetryEventDto[];
}
