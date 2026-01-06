import { DataSource } from 'typeorm';
import { Admin } from './auth/admin.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '9478106',
  database: 'turnero_db',
  entities: [Admin],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();

  const adminRepo = dataSource.getRepository(Admin);

  const exists = await adminRepo.findOneBy({
    email: 'admin@barberia.com',
  });

  if (!exists) {
    await adminRepo.save({
      email: 'admin@barberia.com',
      password: '123456',
    });

    console.log('Admin creado');
  } else {
    console.log('Admin ya existe');
  }

  await dataSource.destroy();
}

seed();
