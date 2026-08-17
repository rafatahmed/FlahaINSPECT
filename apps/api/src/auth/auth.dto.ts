import { IsEmail, IsString, IsUUID, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

export class RefreshDto {
  @IsString()
  @MinLength(16)
  refresh_token!: string;
}

export class SetPasswordDto {
  @IsUUID()
  user_id!: string;

  @IsString()
  @MinLength(10)
  new_password!: string;
}
