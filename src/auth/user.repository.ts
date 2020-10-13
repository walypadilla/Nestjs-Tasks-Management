import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  // sign up method
  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;

    // create new user
    const user = new User();
    user.username = username;
    user.salt = await bcrypt.genSalt();
    user.password = await this.hasPassword(password, user.salt);

    try {
      // save new user in database
      await user.save();
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  // method for validate password
  async validateUserPassword(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<string> {
    const { username, password } = authCredentialsDto;
    const user = await this.findOne({ username });

    // validate if user exists
    if (user && (await user.validatePassword(password))) {
      return user.username;
    } else {
      return null;
    }
  }

  // hashed a password with salt + password
  private async hasPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
