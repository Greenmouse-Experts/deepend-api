import { Module } from "@nestjs/common";
import {
	App,
	applicationDefault,
	cert,
	initializeApp,
} from "firebase-admin/app";
import { getMessaging, Messaging } from "firebase-admin/messaging";

export const FIREBASE_APP = Symbol("FIREBASE_APP");
export const FIREBASE_MESSAGING = Symbol("FIREBASE_MESSAGING");

@Module({
	providers: [
		{
			provide: FIREBASE_APP,
			useFactory: () => {
				if (process.env.FIREBASE_SERVICE_ACCOUNT) {
					const serviceAccount = JSON.parse(
						Buffer.from(
							process.env.FIREBASE_SERVICE_ACCOUNT,
							"base64",
						).toString("utf8"),
					);

					return initializeApp({
						credential: cert(serviceAccount),
					});
				}

				return initializeApp({
					credential: applicationDefault(),
				});
			},
		},
		{
			provide: FIREBASE_MESSAGING,
			inject: [FIREBASE_APP],
			useFactory: (app: App): Messaging => getMessaging(app),
		},
	],
	exports: [FIREBASE_MESSAGING],
})
export class FirebaseModule {}
