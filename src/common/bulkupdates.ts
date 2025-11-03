import { SQL, sql } from "drizzle-orm";
import { AnyColumn } from "drizzle-orm/column";

export interface BulkUpdateTicketInput {
	ticketId: string;
	[key: string]: any;
}

export interface BulkUpdateRecieptInput {
	id: string;
	[key: string]: any;
}

/**
 * Generic helper function to generate SQL for bulk updates with CASE statements
 * Supports updating multiple columns where each row can have different values
 * @param idColumn - The ID column from the schema (e.g., schema.id)
 * @param inputs - Array of objects containing id and all fields to update
 * @param updateFields - Array of field keys to update (all other keys besides 'ticketId')
 * @returns Object containing array of IDs and SQL fragments for each field
 */
export function bulkUpdateTickets<T extends AnyColumn>(
	idColumn: T,
	inputs: BulkUpdateTicketInput[],
	updateFields?: string[],
) {
	if (inputs.length === 0) {
		return {
			ids: [],
			sqlFragments: {},
		};
	}

	// If updateFields not specified, extract all keys except 'ticketId'
	let fieldsArray = updateFields;
	if (!fieldsArray) {
		const allKeys = new Set<string>();
		for (const input of inputs) {
			Object.keys(input).forEach((key) => {
				if (key !== "ticketId") {
					allKeys.add(key);
				}
			});
		}
		fieldsArray = Array.from(allKeys);
	}

	const ids: string[] = [];
	const sqlFragments: Record<string, SQL> = {};

	// Extract unique IDs
	for (const input of inputs) {
		ids.push(input.ticketId);
	}

	// Generate SQL CASE statement for each field
	for (const field of fieldsArray) {
		const sqlChunks: SQL[] = [];

		sqlChunks.push(sql`(case`);

		for (const input of inputs) {
			if (input[field] !== undefined) {
				sqlChunks.push(
					sql`when ${idColumn} = ${input.ticketId} then ${input[field]}`,
				);
			}
		}

		sqlChunks.push(sql`end)`);

		sqlFragments[field] = sql.join(sqlChunks, sql.raw(" "));
	}

	return { ids, sqlFragments };
}

export function bulkUpdateReciepts<T extends AnyColumn>(
	idColumn: T,
	inputs: BulkUpdateRecieptInput[],
	updateFields?: string[],
) {
	if (inputs.length === 0) {
		return {
			ids: [],
			sqlFragments: {},
		};
	}

	// If updateFields not specified, extract all keys except 'ticketId'
	let fieldsArray = updateFields;
	if (!fieldsArray) {
		const allKeys = new Set<string>();
		for (const input of inputs) {
			Object.keys(input).forEach((key) => {
				if (key !== "id") {
					allKeys.add(key);
				}
			});
		}
		fieldsArray = Array.from(allKeys);
	}

	const ids: string[] = [];
	const sqlFragments: Record<string, SQL> = {};

	// Extract unique IDs
	for (const input of inputs) {
		ids.push(input.id);
	}

	// Generate SQL CASE statement for each field
	for (const field of fieldsArray) {
		const sqlChunks: SQL[] = [];

		sqlChunks.push(sql`(case`);

		for (const input of inputs) {
			if (input[field] !== undefined) {
				sqlChunks.push(
					sql`when ${idColumn} = ${input.id} then ${input[field]}`,
				);
			}
		}

		sqlChunks.push(sql`end)`);

		sqlFragments[field] = sql.join(sqlChunks, sql.raw(" "));
	}

	return { ids, sqlFragments };
}
