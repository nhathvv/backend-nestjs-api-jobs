import { SetMetadata } from '@nestjs/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const IS_PUBLIC_PERMISSIONS = 'isPublicPermissions';
export const SkipPermission = () => SetMetadata(IS_PUBLIC_PERMISSIONS, true);

export const RESPONSE_MESSAGE = 'response_message';

export const ResponeMessage = (message: string) => {
  return SetMetadata(RESPONSE_MESSAGE, message);
};

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
