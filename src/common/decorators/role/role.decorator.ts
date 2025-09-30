import { UserRoles } from "./role.enum";
import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export const Role = (...roles: UserRoles[]) => SetMetadata(ROLES_KEY, roles);
