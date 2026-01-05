import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Admin } from './admin.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const admin = await this.adminRepository.findOne({
      where: { email },
    });

    if (!admin || admin.password !== password) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // ✅ AQUÍ VA EL JWT
    return {
      access_token: this.jwtService.sign({
        sub: admin.id,
        email: admin.email,
      }),
    };
  }
}



