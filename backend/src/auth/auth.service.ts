import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async onModuleInit() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (email && password) {
      const existing = await this.prisma.admin.findUnique({ where: { email } });
      if (!existing) {
        const hash = await bcrypt.hash(password, 10);
        await this.prisma.admin.create({
          data: { email, passwordHash: hash },
        });
        console.log(`[Auth] Seeded default admin: ${email}`);
      }
    }
  }

  async login(email: string, pass: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) throw new UnauthorizedException('Invalid credentials');
    
    const isMatch = await bcrypt.compare(pass, admin.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return { access_token: this.jwtService.sign({ email: admin.email, sub: admin.id }) };
  }
}
