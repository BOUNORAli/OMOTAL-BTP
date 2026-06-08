alter table production_records add column if not exists production_family varchar(40) not null default 'DECAPAGE';
alter table production_records add column if not exists diameter varchar(60);
alter table production_records add column if not exists pipe_type varchar(120);
alter table production_records add column if not exists soil_type varchar(120);
alter table production_records add column if not exists pose_type varchar(120);
alter table production_records add column if not exists allocated_gasoil_liters numeric(14,3);
alter table production_records add column if not exists allocated_gasoil_amount numeric(14,2);
alter table production_records add column if not exists allocated_equipment_cost numeric(14,2);
alter table production_records add column if not exists allocated_worker_cost numeric(14,2);
alter table production_records add column if not exists allocated_driver_expenses numeric(14,2);
alter table production_records add column if not exists allocated_other_cost numeric(14,2);
alter table production_records add column if not exists overhead_amount numeric(14,2);
alter table production_records add column if not exists total_allocated_cost numeric(14,2);

alter table production_records
  drop constraint if exists ck_production_family;

alter table production_records
  add constraint ck_production_family check (production_family in (
    'DECAPAGE','REGLAGE','CANA_TRANCHEE','CANA_POSE'
  ));

create table chantier_settings (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  chantier_id uuid not null references chantiers(id),
  standard_hours_per_day numeric(8,2) not null default 9,
  overhead_rate numeric(8,4) not null default 0.05,
  default_vat_rate numeric(8,4) not null default 0.20,
  gasoil_price_strategy varchar(60) not null default 'LAST_VALIDATED',
  currency varchar(20) not null default 'DH',
  constraint uq_chantier_settings unique (chantier_id)
);

create table chantier_reference_values (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  chantier_id uuid not null references chantiers(id),
  category varchar(80) not null,
  reference_value varchar(220) not null,
  normalized_value varchar(220) not null,
  alias_of_value varchar(220),
  active boolean not null default true,
  sort_order integer not null default 0,
  constraint uq_chantier_reference unique (chantier_id, category, normalized_value)
);

create table driver_expenses (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  chantier_id uuid not null references chantiers(id),
  date_start date not null,
  date_end date not null,
  driver varchar(160) not null,
  expense_type varchar(80) not null,
  total_amount numeric(14,2) not null,
  drivers_count numeric(8,2) not null default 1,
  daily_driver_amount numeric(14,2) not null,
  note varchar(500),
  status varchar(40) not null,
  entered_by_user_id uuid not null references app_users(id),
  constraint ck_driver_expense_status check (status in ('BROUILLON','SOUMIS','VALIDE','REJETE','ANNULE','VERROUILLE')),
  constraint ck_driver_expense_dates check (date_end >= date_start)
);

create table import_batches (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  chantier_id uuid not null references chantiers(id),
  file_name varchar(255) not null,
  workbook_role varchar(80) not null,
  status varchar(40) not null,
  total_sheets integer not null default 0,
  total_rows integer not null default 0,
  valid_rows integer not null default 0,
  warning_rows integer not null default 0,
  blocked_rows integer not null default 0,
  committed_at timestamp with time zone,
  created_by_user_id uuid not null references app_users(id)
);

create table import_rows (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  batch_id uuid not null references import_batches(id),
  chantier_id uuid not null references chantiers(id),
  sheet_name varchar(160) not null,
  module varchar(80) not null,
  source_row_number integer not null,
  row_status varchar(40) not null,
  severity varchar(40) not null,
  errors text,
  raw_values text,
  detected_key varchar(260),
  imported_target_type varchar(120),
  imported_target_id uuid
);

create index ix_reference_chantier_category on chantier_reference_values(chantier_id, category);
create index ix_driver_expenses_chantier on driver_expenses(chantier_id);
create index ix_import_batches_chantier on import_batches(chantier_id);
create index ix_import_rows_batch on import_rows(batch_id);
create index ix_import_rows_chantier_module on import_rows(chantier_id, module);
create index ix_production_family_period on production_records(chantier_id, production_family, date);
