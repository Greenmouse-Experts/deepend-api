import { Injectable } from "@nestjs/common";
import { UserRepository } from "./user.repository";
import { CreateUser } from "src/database/schema";

@Injectable()
export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	async getUserById(id: string) {
		return await this.userRepository.findUserById(id);
	}

	async getUserByEmail(email: string) {
		return await this.userRepository.findUserByEmail(email);
	}

	async createUser(
		userData: Omit<CreateUser, "id" | "createdAt" | "updatedAt">,
	) {
		return await this.userRepository.createUser(userData);
	}

	async updateUser(
		id: string,
		updateData: Partial<Omit<CreateUser, " id" | "createdAt" | "updatedAt">>,
	) {
		return await this.userRepository.updateUser(id, updateData);
	}

	async getUserStudioBookings({
		userId,
		page,
		limit,
		status,
	}: { userId: string; page: number; limit: number; status?: string }) {
		const offset = (Number(page) - 1) * Number(limit);

		return await this.userRepository.getUserStudioBookings({
			userId,
			offset,
			limit,
			status,
		});
	}
}
