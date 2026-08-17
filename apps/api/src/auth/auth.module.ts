import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DrizzleAuthStore } from './auth.store';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginLimiter } from './login-limiter';
import { RolesGuard } from './roles.guard';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    DrizzleAuthStore,
    JwtAuthGuard,
    RolesGuard,
    { provide: 'AUTH_STORE', useExisting: DrizzleAuthStore },
    { provide: LoginLimiter, useValue: new LoginLimiter() },
  ],
  exports: [JwtAuthGuard, RolesGuard, 'AUTH_STORE'],
})
export class AuthModule {}
