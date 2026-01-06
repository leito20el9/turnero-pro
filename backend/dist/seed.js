"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const admin_entity_1 = require("./auth/admin.entity");
const dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '9478106',
    database: 'turnero_db',
    entities: [admin_entity_1.Admin],
    synchronize: true,
});
async function seed() {
    await dataSource.initialize();
    const adminRepo = dataSource.getRepository(admin_entity_1.Admin);
    const exists = await adminRepo.findOneBy({
        email: 'admin@barberia.com',
    });
    if (!exists) {
        await adminRepo.save({
            email: 'admin@barberia.com',
            password: '123456',
        });
        console.log('Admin creado');
    }
    else {
        console.log('Admin ya existe');
    }
    await dataSource.destroy();
}
seed();
//# sourceMappingURL=seed.js.map