import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateInspectionPointDto {
  @IsOptional() @IsUUID() session_client_uuid?: string;
  @IsOptional() @IsUUID() session_device_id?: string;
  @IsOptional() @IsDateString() session_started_at?: string;
  @IsOptional() @IsInt() @Min(1) @Max(2147483647) observation_number?: number;

  @IsUUID()
  client_uuid!: string;

  @IsUUID()
  project_id!: string;

  @IsIn(['defect', 'normal', 'note'])
  category!: 'defect' | 'normal' | 'note';

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  note?: string | null;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsOptional()
  @IsNumber()
  accuracy_m?: number | null;

  @IsOptional()
  @IsNumber()
  altitude_m?: number | null;

  @IsOptional()
  @IsNumber()
  heading_deg?: number | null;

  @IsOptional()
  @IsString()
  location_source?: string;

  @IsOptional()
  @IsBoolean()
  location_adjusted?: boolean;

  @IsDateString()
  captured_at!: string;

  @IsOptional()
  @IsObject()
  client_device_info?: Record<string, unknown>;
}

export class PatchInspectionPointDto {
  @IsNumber()
  version!: number;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  remarks?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  recommended_procedure?: string | null;

  @IsOptional()
  @IsIn(['open', 'in_progress', 'resolved', 'closed', 'acknowledged'])
  status?: 'open' | 'in_progress' | 'resolved' | 'closed' | 'acknowledged';
}
