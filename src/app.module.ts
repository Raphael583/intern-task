//console.log("MONGO_URI =", process.env.MONGO_URI);
//console.log("JWT_SECRET =", process.env.JWT_SECRET);
//console.log("JWT_EXPIRES_IN =", process.env.JWT_EXPIRES_IN);
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SessionsModule } from './sessions/sessions.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantMiddleware } from './common/tenant/tenant.middleware';
import { join } from 'path';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, 
    envFilePath: '.env', }),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    TenantsModule,
    UsersModule,
    AuthModule,
    SessionsModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware)
    .exclude(
      'tenants',      //exlude POST/tenants
      'tenants/(.*)'  //exclude any tenants routes
    )
    .forRoutes('*');
  }
}
