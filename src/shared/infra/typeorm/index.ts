import { DataSource } from 'typeorm';

import AppDataSource from './dataSource';

const dataSourceInitialization: Promise<DataSource> =
  AppDataSource.initialize();

export default dataSourceInitialization;
