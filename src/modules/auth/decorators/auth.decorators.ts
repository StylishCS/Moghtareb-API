import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';

export const Auth = () => applyDecorators(UseGuards(AuthGuard), ApiBearerAuth(), ApiCookieAuth());