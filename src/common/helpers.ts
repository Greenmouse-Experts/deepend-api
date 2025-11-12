import { init } from "@paralleldrive/cuid2";
import { ID_GENERATOR_LENGTH, TICKET_ID_LENGTH } from "./constants";
import crypto from "node:crypto";
import {
	addDays,
	differenceInCalendarDays,
	differenceInMinutes,
	getDay,
	parse,
	parseISO,
} from "date-fns";
import { MySqlTransaction } from "drizzle-orm/mysql-core";
import {
	MySql2PreparedQueryHKT,
	MySql2QueryResultHKT,
} from "drizzle-orm/mysql2";
import { ExtractTablesWithRelations, sql } from "drizzle-orm";
import * as databaseSchema from "../database/schema";
import { AxiosError } from "axios";
import { AnyColumn } from "drizzle-orm";
import Decimal from "decimal.js";

export const generateId = init({
	length: ID_GENERATOR_LENGTH,
});

export function generateTicketId() {
	return `T-${init({ length: TICKET_ID_LENGTH })()}`;
}

export function generateOtp(): string {
	const n = crypto.randomInt(0, 1_000_000);

	return String(n).padStart(6, "0");
}

export function maskEmail(email: string, keepStart = 2, keepEnd = 2) {
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

export function getDayFromDate(dateString: string) {
	const date = parseISO(dateString);

	// Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
	const dayOfWeek = getDay(date);

	return dayOfWeek;
}

export function getHoursBetween(startTime: string, endTime: string) {
	// Reference date
	const referenceDate = new Date(2000, 0, 1);

	// Parse the time strings into Date objects
	const startDate = parse(startTime, "HH:mm", referenceDate);

	let endDate = parse(endTime, "HH:mm", referenceDate);

	// Handle cross-midnight scenario
	if (endDate < startDate) {
		endDate = addDays(endDate, 1);
	}

	// Calculate difference in minutes, then convert to hours
	const diffMinutes = differenceInMinutes(endDate, startDate);

	return diffMinutes / 60;
}

export function getDaysBetween(startDateString: string, endDateString: string) {
	const startDate = parseISO(new Date(startDateString).toISOString());
	const endDate = parseISO(new Date(endDateString).toISOString());

	return Math.max(1, differenceInCalendarDays(endDate, startDate));
}

export function calculateStudioTotalPrice(
	hourlyRate: number,
	startTime: string,
	endTime: string,
): number {
	const hours = getHoursBetween(startTime, endTime);

	const total = new Decimal(hourlyRate).mul(hours);

	return total.mul(100).div(100).toNumber();
}

export function calculateEquipmentTotalPrice(
	dailyRate: number,
	startDate: string,
	endDate: string,
): number {
	const days = getDaysBetween(startDate, endDate);

	const total = new Decimal(dailyRate).mul(days);

	return total.mul(100).div(100).toNearest(0.01).toNumber();
}

export function timeToMinutes(timeString: string): number {
	const [hours, minutes] = timeString.split(":").map(Number);
	return hours * 60 + minutes;
}

export function doIntervalsOverlap(
	start1: string,
	end1: string,
	start2: string,
	end2: string,
): boolean {
	let start1Min = timeToMinutes(start1);
	let end1Min = timeToMinutes(end1);
	let start2Min = timeToMinutes(start2);
	let end2Min = timeToMinutes(end2);

	// Handle cross-midnight (add 24 hours)
	if (end1Min <= start1Min) end1Min += 24 * 60;
	if (end2Min <= start2Min) end2Min += 24 * 60;

	// Check for overlap: intervals overlap if start1 < end2 AND start2 < end1
	return start1Min < end2Min && start2Min < end1Min;
}

export function isBookingWithinStudioHours(
	bookingStart: string,
	bookingEnd: string,
	studioOpenTime: string,
	studioCloseTime: string,
): boolean {
	let bookingStartMin = timeToMinutes(bookingStart);
	let bookingEndMin = timeToMinutes(bookingEnd);
	let studioOpenMin = timeToMinutes(studioOpenTime);
	let studioCloseMin = timeToMinutes(studioCloseTime);

	// Handle cross-midnight scenarios
	if (bookingEndMin <= bookingStartMin) bookingEndMin += 24 * 60;
	if (studioCloseMin <= studioOpenMin) studioCloseMin += 24 * 60;

	// Check if booking is completely within studio hours
	return bookingStartMin >= studioOpenMin && bookingEndMin <= studioCloseMin;
}

export type MysqlDatabaseTransaction = MySqlTransaction<
	MySql2QueryResultHKT,
	MySql2PreparedQueryHKT,
	typeof databaseSchema,
	ExtractTablesWithRelations<typeof databaseSchema>
>;

export function HandleAxiosError(error: AxiosError) {
	if (error.response?.status && error.response.status < 500) {
		const errorMessage =
			(error?.response?.data as { message: string }).message || "Bad request";

		return errorMessage;
	}

	console.error(error?.response?.data);

	const errorMessage = "An error occurred";

	return errorMessage;
}

export const decrement = (column: AnyColumn, value: number) => {
	return sql`${column} - ${value}`;
};

export const generateTicketQrCodeData = ({
	ticketId,
	userId,
	secretKey,
}: { ticketId: string; userId: string; secretKey: string }): string => {
	const hmac = crypto.createHmac("sha256", secretKey);
	hmac.update(ticketId + userId);
	const signature = hmac.digest("hex");

	const qrCodeData = JSON.stringify({
		ticketId,
		userId,
		signature,
	});

	return qrCodeData;
};

export const generateReceiptBarcodeData = (
	receiptId: string,
	secretKey: string,
): string => {
	const hmac = crypto.createHmac("sha256", secretKey);
	hmac.update(receiptId);
	const signature = hmac.digest("hex");

	const barcodeData = `${receiptId}|${signature}`;

	return barcodeData;
};

export function generateOrderDescription(
	cartItemType: string,
	quantity: number,
	itemName: string,
): string {
	let description = "";

	switch (cartItemType) {
		case "studio":
			description = `Studio Booking: ${itemName}`;
			break;
		case "food":
			description = `Food Order: ${itemName}`;
			break;
		case "equipment":
			description = `Equipment Rental: ${itemName}`;
			break;
		case "hotel":
			description = `Hotel Booking: ${itemName}`;
			break;
		case "movie":
			description = `Movie Ticket: ${itemName}`;
			break;
		case "vrgame":
			description = `VR Game Session: ${itemName}`;
			break;
		default:
			description = `Order Item: ${itemName}`;
	}

	if (quantity > 1) {
		description += ` (x${quantity})`;
	}

	return description;
}
