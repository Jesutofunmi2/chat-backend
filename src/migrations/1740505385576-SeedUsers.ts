import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from "bcrypt";

export class SeedUsers1740505385576 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const password = await bcrypt.hash("balo5544", 10);
        await queryRunner.query(
        `INSERT INTO "user" (username, password) VALUES ('testuser', '${password}'), ('admin', '${password}');`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "user" WHERE username IN ('testuser', 'admin');`);
    }

}
