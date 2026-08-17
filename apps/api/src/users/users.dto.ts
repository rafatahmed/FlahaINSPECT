import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  full_name!: string;

  @IsString()
  @MinLength(10)
  password!: string;

  @IsOptional()
  @IsIn(['inspector', 'manager', 'client'])
  role?: 'inspector' | 'manager' | 'client';

  @IsOptional()
  @IsString()
  @MaxLength(16)
  locale?: string;
}

export class PatchUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  full_name?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsIn(['inspector', 'manager', 'client'])
  role?: 'inspector' | 'manager' | 'client';

  @IsOptional()
  @IsString()
  @MaxLength(16)
  locale?: string;
}
