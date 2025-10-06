import { sql } from "drizzle-orm";
import { customType } from "drizzle-orm/mysql-core";
import { Geometry } from "wkx";

/** @desc Spatial Reference System ID for Earth's surface */
const SRID = 4326;

/**
 * @desc Defines a `point` column type for the ORM, built on MySQL POINT
 * @see https://dev.mysql.com/doc/refman/8.4/en/gis-point-property-functions.html
 * @see https://github.com/drizzle-team/drizzle-orm/issues/337
 */
export const point = customType<{
	config: never;
	configRequired: false;
	data: { lat: number; lon: number };
	driverData: { x: number; y: number };
}>({
	dataType() {
		return `point`;
	},

	/** @desc Between driver/db and Typescript */
	fromDriver(value) {
		return { lat: value.y, lon: value.x };
	},

	/** @desc Between Typescript and driver/db */
	toDriver(value) {
		// Parse input to wkx/Geometry
		const geo = Geometry.parseGeoJSON({
			coordinates: [value.lon, value.lat],
			type: "Point",
		});

		// Build buffer including SRID value
		const srid_buffer = Buffer.alloc(4);
		srid_buffer.writeUInt32LE(SRID, 0);

		// Data buffer is SRID buffer + point data buffer
		const data_buffer = Buffer.concat([srid_buffer, geo.toWkb()]);

		return sql`UNHEX(${data_buffer.toString("hex")})`;
	},
});
