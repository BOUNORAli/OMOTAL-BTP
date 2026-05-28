create table app_users (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  name varchar(160) not null,
  email varchar(180) not null unique,
  password_hash varchar(255) not null,
  role varchar(40) not null,
  active boolean not null default true,
  constraint ck_user_role check (role in (
    'SUPER_ADMIN','DIRECTEUR','RESPONSABLE_CHANTIER','POINTEUR','COMPTABLE','MATERIEL','LECTURE_SEULE'
  ))
);

create table chantiers (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  name varchar(180) not null,
  code varchar(80) not null unique,
  client varchar(180) not null,
  location varchar(180) not null,
  started_at date not null,
  expected_end_at date,
  market_amount_ht numeric(16,2),
  status varchar(40) not null,
  manager_user_id uuid,
  constraint ck_chantier_status check (status in ('PREPARATION','EN_COURS','SUSPENDU','TERMINE','ARCHIVE'))
);

create table chantier_user_access (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  chantier_id uuid not null references chantiers(id),
  user_id uuid not null references app_users(id),
  constraint uq_chantier_user unique (chantier_id, user_id)
);

create table suppliers (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  name varchar(180) not null,
  type varchar(40) not null,
  phone varchar(60),
  active boolean not null default true,
  constraint ck_supplier_type check (type in ('STATION','MATIERE','TRANSPORT','ENTRETIEN','SOUS_TRAITANT','LOUEUR','AUTRE'))
);

create table equipment (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  designation varchar(180) not null,
  type varchar(80) not null,
  owner varchar(180) not null,
  chantier_id uuid not null references chantiers(id),
  billing_mode varchar(40) not null,
  hourly_rate numeric(14,2),
  daily_rate numeric(14,2),
  usual_driver varchar(120),
  status varchar(40) not null,
  constraint ck_equipment_billing check (billing_mode in ('HEURE','JOUR','FORFAIT','INTERNE')),
  constraint ck_equipment_status check (status in ('MOBILISE','DEMOBILISE','EN_PANNE','ARRETE','ARCHIVE'))
);

create table employees (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  first_name varchar(120) not null,
  last_name varchar(120) not null,
  position varchar(120) not null,
  chantier_id uuid not null references chantiers(id),
  remuneration_type varchar(40) not null,
  monthly_salary numeric(14,2),
  daily_salary numeric(14,2),
  hourly_salary numeric(14,2),
  active boolean not null default true,
  constraint ck_employee_remuneration check (remuneration_type in ('HEURE','JOUR','MOIS'))
);

create table caisse_transactions (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  date date not null,
  chantier_id uuid not null references chantiers(id),
  type varchar(20) not null,
  amount numeric(14,2) not null,
  payment_mode varchar(40) not null,
  category varchar(60) not null,
  description varchar(500) not null,
  person_or_supplier varchar(180),
  status varchar(40) not null,
  has_document boolean not null default false,
  entered_by_user_id uuid not null references app_users(id),
  validated_by_user_id uuid references app_users(id),
  constraint ck_transaction_type check (type in ('DEBIT','CREDIT')),
  constraint ck_transaction_amount check (amount > 0),
  constraint ck_transaction_status check (status in ('BROUILLON','SOUMIS','VALIDE','REJETE','ANNULE','VERROUILLE')),
  constraint ck_payment_mode check (payment_mode in ('ESPECES_OMOTAL','BANQUE_OMOTAL','ESPECES_ETP','AUTRE')),
  constraint ck_transaction_category check (category in (
    'PERSONNEL','GASOIL','MATIERES','LOCATION_ENGINS','ENTRETIEN','TRANSPORT','ETP','FRAIS_GENERAUX','FINANCEMENT','DIVERS'
  ))
);

create table gasoil_entries (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  date date not null,
  chantier_id uuid not null references chantiers(id),
  supplier_id uuid not null references suppliers(id),
  liters numeric(14,2) not null,
  unit_price numeric(14,2) not null,
  receipt_number varchar(120),
  status varchar(40) not null,
  has_document boolean not null default false,
  entered_by_user_id uuid not null references app_users(id),
  constraint ck_gasoil_entry_liters check (liters > 0),
  constraint ck_gasoil_entry_price check (unit_price > 0),
  constraint ck_gasoil_entry_status check (status in ('BROUILLON','SOUMIS','VALIDE','REJETE','ANNULE','VERROUILLE')),
  constraint uq_gasoil_entry_receipt unique (chantier_id, receipt_number)
);

create table gasoil_exits (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  date date not null,
  chantier_id uuid not null references chantiers(id),
  equipment_id uuid references equipment(id),
  responsible varchar(160) not null,
  allocation varchar(80) not null,
  liters numeric(14,2) not null,
  unit_price numeric(14,2) not null,
  exit_number varchar(120),
  status varchar(40) not null,
  has_document boolean not null default false,
  entered_by_user_id uuid not null references app_users(id),
  validated_by_user_id uuid references app_users(id),
  constraint ck_gasoil_exit_liters check (liters > 0),
  constraint ck_gasoil_exit_price check (unit_price > 0),
  constraint ck_gasoil_exit_status check (status in ('BROUILLON','SOUMIS','VALIDE','REJETE','ANNULE','VERROUILLE')),
  constraint uq_gasoil_exit_number unique (chantier_id, exit_number)
);

create table personnel_timesheets (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  date date not null,
  chantier_id uuid not null references chantiers(id),
  employee_id uuid not null references employees(id),
  hours_worked numeric(8,2) not null,
  day_type varchar(40) not null,
  applied_remuneration_type varchar(40) not null,
  applied_hourly_rate numeric(14,2),
  applied_daily_rate numeric(14,2),
  applied_monthly_salary numeric(14,2),
  status varchar(40) not null,
  constraint ck_personnel_day check (day_type in ('NORMAL','ABSENCE','CONGE','ARRET','DEMI_JOURNEE')),
  constraint ck_personnel_remuneration check (applied_remuneration_type in ('HEURE','JOUR','MOIS')),
  constraint ck_personnel_status check (status in ('BROUILLON','SOUMIS','VALIDE','REJETE','ANNULE','VERROUILLE')),
  constraint uq_personnel_day unique (chantier_id, employee_id, date)
);

create table personnel_advances (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  date date not null,
  chantier_id uuid not null references chantiers(id),
  employee_id uuid not null references employees(id),
  amount numeric(14,2) not null,
  transaction_id uuid,
  status varchar(40) not null,
  constraint ck_advance_amount check (amount > 0),
  constraint ck_advance_status check (status in ('BROUILLON','SOUMIS','VALIDE','REJETE','ANNULE','VERROUILLE'))
);

create table equipment_timesheets (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  date date not null,
  chantier_id uuid not null references chantiers(id),
  equipment_id uuid not null references equipment(id),
  driver varchar(160) not null,
  hours_worked numeric(8,2),
  days_billed numeric(8,2),
  activity_type varchar(80) not null,
  applied_billing_mode varchar(40) not null,
  applied_hourly_rate numeric(14,2),
  applied_daily_rate numeric(14,2),
  status varchar(40) not null,
  validated_by_user_id uuid references app_users(id),
  constraint ck_equipment_timesheet_mode check (applied_billing_mode in ('HEURE','JOUR','FORFAIT','INTERNE')),
  constraint ck_equipment_timesheet_status check (status in ('BROUILLON','SOUMIS','VALIDE','REJETE','ANNULE','VERROUILLE'))
);

create table documents (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  chantier_id uuid not null references chantiers(id),
  document_type varchar(80) not null,
  file_name varchar(255) not null,
  content_type varchar(120) not null,
  size_bytes bigint not null,
  storage_key varchar(500) not null,
  module varchar(80) not null,
  target_type varchar(120) not null,
  target_id uuid not null,
  added_by_user_id uuid not null references app_users(id),
  cancelled boolean not null default false
);

create table audit_logs (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  user_id uuid not null references app_users(id),
  module varchar(80) not null,
  operation varchar(120) not null,
  target_type varchar(120) not null,
  target_id uuid not null,
  old_value text,
  new_value text,
  reason varchar(500),
  occurred_at timestamp with time zone not null
);

create table validation_logs (
  id uuid primary key,
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  target_type varchar(120) not null,
  target_id uuid not null,
  user_id uuid not null references app_users(id),
  from_status varchar(40) not null,
  to_status varchar(40) not null,
  reason varchar(500),
  occurred_at timestamp with time zone not null
);

create index ix_chantier_access_user on chantier_user_access(user_id);
create index ix_transactions_chantier on caisse_transactions(chantier_id);
create index ix_gasoil_entries_chantier on gasoil_entries(chantier_id);
create index ix_gasoil_exits_chantier on gasoil_exits(chantier_id);
create index ix_equipment_chantier on equipment(chantier_id);
create index ix_employees_chantier on employees(chantier_id);
