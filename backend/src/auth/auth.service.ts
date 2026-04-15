import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(email: string, pass: string) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin1234!!';

    if (email !== adminEmail || pass !== adminPass) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { access_token: this.jwtService.sign({ email: adminEmail, sub: 'admin-id' }) };
  }
}
