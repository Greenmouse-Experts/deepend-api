import { DrizzleQueryError } from "drizzle-orm";
import { QueryError } from "mysql2/promise";

export enum mysqlErrorCodes {
	FOREIGN_KEY_VIOLATION = "ER_NO_REFERENCED_ROW_2", // errno 1452
	DUPLICATE_ENTRY = "ER_DUP_ENTRY", // errno 1062
	DATA_TOO_LONG = "ER_DATA_TOO_LONG", // errno 1406
	BAD_NULL_ERROR = "ER_BAD_NULL_ERROR", // errno 1048
	CHECK_CONSTRAINT_VIOLATED = "ER_CHECK_CONSTRAINT_VIOLATED", // errno 3819
	ROW_IS_REFERENCED = "ER_ROW_IS_REFERENCED_2", // errno 1451
	TRUNCATED_WRONG_VALUE = "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD", // errno 1366
	OUT_OF_RANGE_VALUE = "ER_WARN_DATA_OUT_OF_RANGE", // errno 1264
}

export interface MySQLDriverError {
	code: string;
	errno: number;
	sqlMessage: string;
	sqlState: string;
	sql?: string;
}

export class MySQLError extends Error {
	public status: number;
	public isClientError: boolean;

	constructor(mysqlError: MySQLDriverError) {
		super(mysqlError.sqlMessage);
		this.name = "MySQLError";

		const { status, message, isClientError } =
			MySQLError.parseMySQLError(mysqlError);

		this.status = status;
		this.message = message;
		this.isClientError = isClientError;
	}

	static parseMySQLError(error: any) {
		switch (error.code) {
			case mysqlErrorCodes.DUPLICATE_ENTRY: {
				// Extract field name from error message like "Duplicate entry 'value' for key 'field_name'"
				const fieldMatch = error.sqlMessage?.match(/for key '([^']+)'/);
				const field = fieldMatch ? fieldMatch[1].replace(/_/g, " ") : "value";
				return {
					status: 400,
					message: `The ${field} already exists.`,
					isClientError: true,
				};
			}
			case mysqlErrorCodes.FOREIGN_KEY_VIOLATION: {
				// Extract constraint info from error message
				const constraintMatch = error.sqlMessage?.match(/CONSTRAINT "([^"]+)"/);
				const tableMatch = error.sqlMessage?.match(/REFERENCES "([^"]+)"/);

				let field = "referenced field";
				let table = "related data";

				if (constraintMatch) {
					// Parse constraint name like "foods_category_id_food_categories_id_fk"
					const constraintParts = constraintMatch[1].split("_");
					if (constraintParts.length >= 2) {
						field = constraintParts[1].replace(/_/g, " ");
					}
				}

				if (tableMatch) {
					table = tableMatch[1].replace(/_/g, " ");
				}

				return {
					status: 400,
					message: `Invalid reference: The provided ${field} does not exist in ${table}. Ensure the related data is available.`,
					isClientError: true,
				};
			}
			case mysqlErrorCodes.BAD_NULL_ERROR: {
				// Extract column name from error message like "Column 'column_name' cannot be null"
				const columnMatch = error.sqlMessage?.match(/Column '([^']+)'/);
				const column = columnMatch
					? columnMatch[1].replace(/_/g, " ")
					: "field";
				return {
					status: 400,
					message: `The field '${column}' is required.`,
					isClientError: true,
				};
			}
			case mysqlErrorCodes.DATA_TOO_LONG: {
				const columnMatch = error.sqlMessage?.match(/for column '([^']+)'/);
				const column = columnMatch
					? columnMatch[1].replace(/_/g, " ")
					: "field";
				return {
					status: 400,
					message: `Input is too long for ${column}. Please shorten the text.`,
					isClientError: true,
				};
			}
			case mysqlErrorCodes.CHECK_CONSTRAINT_VIOLATED: {
				const constraintMatch = error.sqlMessage?.match(
					/Check constraint '([^']+)'/,
				);
				const constraint = constraintMatch
					? ` (${constraintMatch[1].replace(/_/g, " ")})`
					: "";
				return {
					status: 400,
					message: `Input does not meet the required condition${constraint}. Please check and adjust your values.`,
					isClientError: true,
				};
			}
			case mysqlErrorCodes.OUT_OF_RANGE_VALUE: {
				const columnMatch = error.sqlMessage?.match(/for column '([^']+)'/);
				const column = columnMatch
					? columnMatch[1].replace(/_/g, " ")
					: "field";
				return {
					status: 400,
					message: `Numeric value is too large for ${column}. Provide a smaller number.`,
					isClientError: true,
				};
			}
			case mysqlErrorCodes.TRUNCATED_WRONG_VALUE: {
				return {
					status: 400,
					message: "Invalid data format. Check input values.",
					isClientError: true,
				};
			}
			case mysqlErrorCodes.ROW_IS_REFERENCED:
				return {
					status: 400,
					message:
						"This record cannot be deleted as it is referenced elsewhere.",
					isClientError: true,
				};
			default:
				return {
					status: 500,
					message: "An error occurred.",
					isClientError: false,
				};
		}
	}
}

export function isDatabaseError(error: any) {
	if (error instanceof DrizzleQueryError) {
		const cause = error.cause as QueryError;
		return {
			isDatabaseError: true,
			code: cause.code,
		};
	}
	return { isDatabaseError: false, code: null, errno: null };
}
