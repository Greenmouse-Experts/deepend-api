import { Injectable } from "@nestjs/common";
import * as argon2 from "@node-rs/argon2";

@Injectable()
export class PasswordService {
	async hashPassword(rawPassword: string) {
		return await argon2.hash(rawPassword);
	}

	async comparePassword(
		password: string,
		hashedPassword: string,
	): Promise<boolean> {
		const isMatch = await argon2.verify(hashedPassword, password);

		return isMatch;
	}
}
