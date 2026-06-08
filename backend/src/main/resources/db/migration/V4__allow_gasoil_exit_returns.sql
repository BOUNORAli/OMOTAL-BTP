alter table gasoil_exits
  drop constraint if exists ck_gasoil_exit_liters;

alter table gasoil_exits
  add constraint ck_gasoil_exit_liters check (liters <> 0);
