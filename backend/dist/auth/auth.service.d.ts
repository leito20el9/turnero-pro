import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Admin } from './admin.entity';
export declare class AuthService {
    private adminRepository;
    private jwtService;
    constructor(adminRepository: Repository<Admin>, jwtService: JwtService);
    login(email: string, password: string): Promise<{
        access_token: string;
    }>;
}
