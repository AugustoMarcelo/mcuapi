const dev = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  extra: {
    ssl: {
      rejectUnauthorized: false
    }
  },
  entities: [
    "./src/modules/**/infra/typeorm/entities/*.ts",
  ],
  migrations: [
    "./src/shared/infra/typeorm/migrations/*.ts"
  ],
  seeds: [
    "./src/shared/infra/typeorm/seeds/*.ts",
  ],
  factories: [
    "./src/shared/infra/typeorm/factories/*.ts",
  ],
  cli: {
    "migrationsDir": "./src/shared/infra/typeorm/migrations"
  }
}

const production = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [
    "./dist/modules/**/infra/typeorm/entities/*.js",
  ],
  migrations: [
    "./dist/shared/infra/typeorm/migrations/*.js",
  ],
  seeds: [
    "./dist/shared/infra/typeorm/seeds/*.js",
  ],
  factories: [
    "./dist/shared/infra/typeorm/factories/*.js",
  ],
  cli: {
    "migrationsDir": "./dist/shared/infra/typeorm/migrations",
  }
}

module.exports = process.env.NODE_ENV === 'production' ? production : dev;
