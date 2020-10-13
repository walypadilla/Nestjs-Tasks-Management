import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  // signUp user
  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.userRepository.signUp(authCredentialsDto);
  }

  // signIn
  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const username = await this.userRepository.validateUserPassword(
      authCredentialsDto,
    );
    // if user not exists
    if (!username) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // create token
    const payload: JwtPayload = { username };
    const accessToken = await this.jwtService.sign(payload);
    this.logger.debug(
      `Generated JWT Token with paylad ${JSON.stringify(payload)}`,
    );

    return { accessToken };
  }
}
