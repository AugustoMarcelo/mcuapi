import { DataSource } from 'typeorm';

import AppDataSource from './dataSource';

export async function initializeDataSource(): Promise<DataSource> {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }

  return AppDataSource.initialize();
}

export default initializeDataSource;
