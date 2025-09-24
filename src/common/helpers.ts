import { init } from "@paralleldrive/cuid2";
import { ID_GENERATOR_LENGTH } from "./constants";
import crypto from "node:crypto";

export const generateId = init({
	length: ID_GENERATOR_LENGTH,
});

export function generateOtp(): string {
	const n = crypto.randomInt(0, 1_000_000);

	return String(n).padStart(6, "0");
}

export function maskEmail(
	email: string,
	keepStart = 2,
	keepEnd = 2,
) {
	const [local, domain] = email.split("@");
	if (!domain) return email;

	if (local.length <= keepStart + keepEnd) {
		return local[0] + "*".repeat(Math.max(0, local.length - 1)) + "@" + domain;
	}

	const start = local.slice(0, keepStart);
	const end = local.slice(-keepEnd);
	const masked = start + "*".repeat(local.length - keepStart - keepEnd) + end;
	return `${masked}@${domain}`;
}
