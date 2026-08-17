import { IsIn, IsObject, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  boundary?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  bbox?: Record<string, unknown>;
}

export class PatchProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  boundary?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  bbox?: Record<string, unknown>;
}

export class AddMemberDto {
  @IsUUID()
  user_id!: string;

  @IsOptional()
  @IsIn(['inspector', 'manager', 'client'])
  member_role?: 'inspector' | 'manager' | 'client';
}
