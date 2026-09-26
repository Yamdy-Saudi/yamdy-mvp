-- Keep credential references inaccessible even if private schema exposure changes later.
alter table private.aggregator_credentials enable row level security;
