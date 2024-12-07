import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY, IS_PUBLIC_PERMISSIONS } from 'src/decorator/customize';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    const isPublicPermission = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_PERMISSIONS,
      [context.getHandler(), context.getClass()],
    );
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          'Token không hợp lệ hoặc không truyền lên Bearer Token ở Headers request!',
        )
      );
    }
    const targetMethod = request.method;
    const targetEndPoint = request.route.path;
    const permissions = user?.permissions ?? [];
    let isExits = permissions.find((permission) => {
      return (
        targetEndPoint === permission.apiPath &&
        targetMethod === permission.method
      );
    });
    if (targetEndPoint.startsWith('/api/v1/auth')) isExits = true;
    if (!isExits && !isPublicPermission) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập Endpoint này !!!',
      );
    }
    return user;
  }
}
