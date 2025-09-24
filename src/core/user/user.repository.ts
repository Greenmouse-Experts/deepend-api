import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "src/database/database.service";
import { CreateUser, users } from "src/database/schema";

@Injectable()
export class UserRepository {
	constructor(private readonly databaseService: DatabaseService) {}

	async findUserById(id: string) {
		return this.databaseService.db.query.users.findFirst({
			where: eq(users.id, id),
		});
	}

	async findUserByEmail(email: string) {
		return this.databaseService.db.query.users.findFirst({
			where: eq(users.email, email),
		});
	}

	async createUser(
		userData: Omit<CreateUser, "id" | "createdAt" | "updatedAt">,
	) {
		const newUser = await this.databaseService.db
			.insert(users)
			.values(userData)
			.$returningId();

		return newUser.pop();
	}

	async updateUser(
		id: string,
		updateData: Partial<Omit<CreateUser, " id" | "createdAt" | "updatedAt">>,
	) {
		await this.databaseService.db
			.update(users)
			.set(updateData)
			.where(eq(users.id, id));
	}
}
