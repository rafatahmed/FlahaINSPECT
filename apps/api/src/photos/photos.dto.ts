import { IsIn, IsInt, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min } from 'class-validator';

export class RegisterPhotoDto {
  @IsUUID()
  client_uuid!: string;

  @IsUUID()
  inspection_point_client_uuid!: string;

  @IsUUID()
  project_id!: string;

  @IsString()
  @Matches(/^[0-9a-fA-F]{64}$/)
  sha256!: string;

  @IsInt()
  @Min(1)
  @Max(25 * 1024 * 1024)
  byte_size!: number;

  @IsOptional()
  @IsIn(['image/jpeg', 'image/png'])
  content_type?: string;

  @IsOptional()
  @IsInt()
  width_px?: number;

  @IsOptional()
  @IsInt()
  height_px?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  original_filename?: string;
}
