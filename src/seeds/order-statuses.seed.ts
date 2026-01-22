import { DataSource } from 'typeorm';
import { OrderStatus } from '../orders/entities/order-status.entity';

export async function seedOrderStatuses(ds: DataSource) {
  const repo = ds.getRepository(OrderStatus);

  const statuses: Array<Partial<OrderStatus>> = [
    { code: 'new', name: 'Nowe', sort: 10, isActive: true },
    { code: 'paid', name: 'Opłacone', sort: 20, isActive: true },
    { code: 'shipped', name: 'Wysłane', sort: 30, isActive: true },
    { code: 'cancelled', name: 'Anulowane', sort: 40, isActive: true },
  ];

  for (const s of statuses) {
    const exists = await repo.findOne({ where: { code: s.code! } });

    if (!exists) {
      await repo.save(repo.create(s));
      console.log('[seedOrderStatuses] created:', s.code);
      continue;
    }

    // update (żeby można było poprawić nazwy/sorty)
    await repo.update(exists.id, {
      name: s.name,
      sort: s.sort,
      isActive: s.isActive,
    });
    console.log('[seedOrderStatuses] updated:', s.code);
  }
}