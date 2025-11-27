import { Module } from "@nestjs/common";
import { NotificationService } from "./notification.service";

import { FirebaseModule } from "../firbase/firebase.module";
import { DatabaseModule } from "src/database/database.module";

@Module({
	imports: [FirebaseModule, DatabaseModule],
	providers: [NotificationService],
	exports: [NotificationService],
})
export class NotificationModule {}
