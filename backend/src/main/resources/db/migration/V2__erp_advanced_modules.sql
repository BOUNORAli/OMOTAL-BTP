create table production_records (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  date date not null,
  chantier_id uuid not null references chantiers(id),
  voie varchar(120) not null,
  tranche varchar(120),
  troncon varchar(120),
  work_type varchar(120) not null,
  equipment_id uuid references equipment(id),
  driver varchar(160),
  length_value numeric(14,3),
  width_value numeric(14,3),
  depth_value numeric(14,3),
  quantity numeric(14,3) not null,
  unit varchar(20) not null,
  hours numeric(8,2),
  status varchar(40) not null,
  entered_by_user_id uuid not null references app_users(id),
  validated_by_user_id uuid references app_users(id),
  constraint ck_production_quantity check (quantity >= 0),
  constraint ck_production_status check (status in ('BROUILLON','SOUMIS','VALIDE','REJETE','ANNULE','VERROUILLE'))
);

create table material_purchases (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  date date not null,
  chantier_id uuid not null references chantiers(id),
  supplier_id uuid not null references suppliers(id),
  designation varchar(220) not null,
  unit varchar(40) not null,
  quantity numeric(14,3) not null,
  unit_price_ht numeric(14,2) not null,
  transport_ht numeric(14,2) not null default 0,
  total_ht numeric(14,2) not null,
  vat_rate numeric(6,3) not null default 0,
  total_ttc numeric(14,2) not null,
  receipt_number varchar(120),
  supplier_document_number varchar(120),
  due_date date,
  paid_amount numeric(14,2) not null default 0,
  status varchar(40) not null,
  has_document boolean not null default false,
  entered_by_user_id uuid not null references app_users(id),
  constraint ck_material_quantity check (quantity > 0),
  constraint ck_material_unit_price check (unit_price_ht >= 0),
  constraint ck_material_status check (status in ('BROUILLON','SOUMIS','VALIDE','REJETE','ANNULE','VERROUILLE')),
  constraint uq_material_receipt unique (chantier_id, receipt_number)
);

create table supplier_payments (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  date date not null,
  chantier_id uuid not null references chantiers(id),
  supplier_id uuid not null references suppliers(id),
  amount numeric(14,2) not null,
  payment_mode varchar(40) not null,
  status varchar(40) not null,
  note varchar(500),
  entered_by_user_id uuid not null references app_users(id),
  constraint ck_supplier_payment_amount check (amount > 0),
  constraint ck_supplier_payment_mode check (payment_mode in ('ESPECES_OMOTAL','BANQUE_OMOTAL','ESPECES_ETP','AUTRE')),
  constraint ck_supplier_payment_status check (status in ('BROUILLON','SOUMIS','VALIDE','REJETE','ANNULE','VERROUILLE'))
);

create table etp_prestations (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  date date not null,
  chantier_id uuid not null references chantiers(id),
  supplier_id uuid not null references suppliers(id),
  designation varchar(220) not null,
  quantity numeric(14,3) not null,
  unit_price numeric(14,2) not null,
  amount_ht numeric(14,2) not null,
  vat_rate numeric(6,3) not null default 0,
  amount_ttc numeric(14,2) not null,
  status varchar(40) not null,
  entered_by_user_id uuid not null references app_users(id),
  constraint ck_etp_prestation_quantity check (quantity > 0),
  constraint ck_etp_prestation_status check (status in ('BROUILLON','SOUMIS','VALIDE','REJETE','ANNULE','VERROUILLE'))
);

create table etp_imputations (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  date date not null,
  chantier_id uuid not null references chantiers(id),
  supplier_id uuid not null references suppliers(id),
  imputation_type varchar(80) not null,
  amount numeric(14,2) not null,
  note varchar(500),
  status varchar(40) not null,
  entered_by_user_id uuid not null references app_users(id),
  constraint ck_etp_imputation_amount check (amount >= 0),
  constraint ck_etp_imputation_status check (status in ('BROUILLON','SOUMIS','VALIDE','REJETE','ANNULE','VERROUILLE'))
);

create table transport_records (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  date date not null,
  chantier_id uuid not null references chantiers(id),
  supplier_id uuid not null references suppliers(id),
  designation varchar(220) not null,
  departure varchar(180),
  arrival varchar(180),
  trips numeric(10,2) not null,
  unit_price numeric(14,2) not null,
  total_amount numeric(14,2) not null,
  receipt_number varchar(120),
  allocation varchar(120),
  status varchar(40) not null,
  has_document boolean not null default false,
  entered_by_user_id uuid not null references app_users(id),
  constraint ck_transport_trips check (trips > 0),
  constraint ck_transport_status check (status in ('BROUILLON','SOUMIS','VALIDE','REJETE','ANNULE','VERROUILLE'))
);

create table maintenance_records (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  date date not null,
  chantier_id uuid not null references chantiers(id),
  equipment_id uuid not null references equipment(id),
  supplier_id uuid references suppliers(id),
  intervention_type varchar(120) not null,
  designation varchar(220) not null,
  quantity numeric(14,3) not null,
  unit_price numeric(14,2) not null,
  total_amount numeric(14,2) not null,
  immobilized boolean not null default false,
  downtime_days numeric(8,2),
  status varchar(40) not null,
  has_document boolean not null default false,
  entered_by_user_id uuid not null references app_users(id),
  constraint ck_maintenance_quantity check (quantity > 0),
  constraint ck_maintenance_status check (status in ('BROUILLON','SOUMIS','VALIDE','REJETE','ANNULE','VERROUILLE'))
);

create table bq_articles (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  chantier_id uuid not null references chantiers(id),
  article_number varchar(80) not null,
  designation varchar(260) not null,
  unit varchar(40) not null,
  market_quantity numeric(14,3) not null,
  market_unit_price_ht numeric(14,2) not null,
  planned_cost_total numeric(14,2) not null default 0,
  active boolean not null default true,
  constraint uq_bq_article unique (chantier_id, article_number)
);

create table bq_realisations (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  date date not null,
  chantier_id uuid not null references chantiers(id),
  bq_article_id uuid not null references bq_articles(id),
  quantity numeric(14,3) not null,
  source varchar(80) not null,
  status varchar(40) not null,
  entered_by_user_id uuid not null references app_users(id),
  constraint ck_bq_realisation_quantity check (quantity >= 0),
  constraint ck_bq_realisation_status check (status in ('BROUILLON','SOUMIS','VALIDE','REJETE','ANNULE','VERROUILLE'))
);

create index ix_production_chantier on production_records(chantier_id);
create index ix_material_chantier on material_purchases(chantier_id);
create index ix_supplier_payments_chantier on supplier_payments(chantier_id);
create index ix_etp_prestations_chantier on etp_prestations(chantier_id);
create index ix_transport_chantier on transport_records(chantier_id);
create index ix_maintenance_chantier on maintenance_records(chantier_id);
create index ix_bq_articles_chantier on bq_articles(chantier_id);
