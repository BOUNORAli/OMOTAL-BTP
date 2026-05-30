"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import {
  useChantiers,
  useCreateChantier,
  useCreateEmployee,
  useCreateEquipment,
  useCreateEquipmentTimesheet,
  useCreateFournisseur,
  useCreateGasoilEntry,
  useCreatePersonnelTimesheet,
  useCreateTransaction,
  useCreateUser,
  useEngins,
  useFournisseurs,
  usePersonnel,
} from "@/hooks/use-app-data";
import type { BillingMode, DayType, Equipment, EquipmentTimesheet, PaymentMode, RemunerationType, Role, Supplier, TransactionCategory, TransactionType } from "@/lib/domain/types";
import { useAppStore } from "@/stores/app-store";

const today = () => new Date().toISOString().slice(0, 10);

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function FormMessage({ error, success }: { error?: Error | null; success?: boolean }) {
  if (error) return <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error.message}</p>;
  if (success) return <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">Operation enregistree.</p>;
  return null;
}

export function ChantierForm() {
  const mutation = useCreateChantier();
  const currentUser = useAppStore((state) => state.currentUser);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [client, setClient] = useState("");
  const [location, setLocation] = useState("");
  const [startedAt, setStartedAt] = useState(today());
  const [expectedEndAt, setExpectedEndAt] = useState("");
  const [marketAmountHt, setMarketAmountHt] = useState("");

  return (
    <Card className="mb-6 p-4">
      <form
        className="grid gap-3 md:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate({
            name,
            code,
            client,
            location,
            startedAt,
            expectedEndAt: expectedEndAt || undefined,
            marketAmountHt: marketAmountHt ? Number(marketAmountHt) : undefined,
            managerUserId: currentUser.id,
          });
        }}
      >
        <Field label="Nom"><Input onChange={(event) => setName(event.target.value)} required value={name} /></Field>
        <Field label="Code"><Input onChange={(event) => setCode(event.target.value)} required value={code} /></Field>
        <Field label="Maitre d'ouvrage"><Input onChange={(event) => setClient(event.target.value)} required value={client} /></Field>
        <Field label="Localisation"><Input onChange={(event) => setLocation(event.target.value)} required value={location} /></Field>
        <Field label="Debut"><Input onChange={(event) => setStartedAt(event.target.value)} required type="date" value={startedAt} /></Field>
        <Field label="Fin prev."><Input onChange={(event) => setExpectedEndAt(event.target.value)} type="date" value={expectedEndAt} /></Field>
        <Field label="Marche HT"><Input inputMode="decimal" onChange={(event) => setMarketAmountHt(event.target.value)} type="number" value={marketAmountHt} /></Field>
        <div className="flex items-end"><Button disabled={mutation.isPending} type="submit">Creer chantier</Button></div>
        <div className="md:col-span-4"><FormMessage error={mutation.error} success={mutation.isSuccess} /></div>
      </form>
    </Card>
  );
}

export function UserForm() {
  const mutation = useCreateUser();
  const { data: chantiers = [] } = useChantiers();
  const [role, setRole] = useState<Role>("pointeur");
  const [chantierId, setChantierId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password");

  return (
    <Card className="p-4">
      <form
        className="grid gap-3 md:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate({ name, email, password, role, chantierIds: chantierId ? [chantierId] : [] });
        }}
      >
        <Field label="Nom"><Input onChange={(event) => setName(event.target.value)} required value={name} /></Field>
        <Field label="Email"><Input onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></Field>
        <Field label="Mot de passe"><Input onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></Field>
        <Field label="Role">
          <Select onChange={(event) => setRole(event.target.value as Role)} value={role}>
            {["super_admin", "directeur", "responsable_chantier", "pointeur", "comptable", "materiel", "lecture_seule"].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </Select>
        </Field>
        <Field label="Chantier">
          <Select onChange={(event) => setChantierId(event.target.value)} value={chantierId}>
            <option value="">Tous / aucun specifique</option>
            {chantiers.map((chantier) => <option key={chantier.id} value={chantier.id}>{chantier.name}</option>)}
          </Select>
        </Field>
        <div className="flex items-end"><Button disabled={mutation.isPending} type="submit">Creer utilisateur</Button></div>
        <div className="md:col-span-3"><FormMessage error={mutation.error} success={mutation.isSuccess} /></div>
      </form>
    </Card>
  );
}

export function FournisseurForm() {
  const mutation = useCreateFournisseur();
  const [name, setName] = useState("");
  const [type, setType] = useState<Supplier["type"]>("station");
  const [phone, setPhone] = useState("");

  return (
    <Card className="mb-6 p-4">
      <form className="grid gap-3 md:grid-cols-4" onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate({ name, type, phone });
      }}>
        <Field label="Nom"><Input onChange={(event) => setName(event.target.value)} required value={name} /></Field>
        <Field label="Type">
          <Select onChange={(event) => setType(event.target.value as Supplier["type"])} value={type}>
            {["station", "matiere", "transport", "entretien", "sous_traitant", "loueur", "autre"].map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
        </Field>
        <Field label="Telephone"><Input onChange={(event) => setPhone(event.target.value)} value={phone} /></Field>
        <div className="flex items-end"><Button disabled={mutation.isPending} type="submit">Creer fournisseur</Button></div>
        <div className="md:col-span-4"><FormMessage error={mutation.error} success={mutation.isSuccess} /></div>
      </form>
    </Card>
  );
}

export function TransactionForm() {
  const mutation = useCreateTransaction();
  const chantierId = useAppStore((state) => state.selectedChantierId);
  const [type, setType] = useState<TransactionType>("debit");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("banque_omotal");
  const [category, setCategory] = useState<TransactionCategory>("gasoil");
  const [description, setDescription] = useState("");
  const [personOrSupplier, setPersonOrSupplier] = useState("");

  return (
    <Card className="mb-6 p-4">
      <form className="grid gap-3 md:grid-cols-4" onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate({
          date: today(),
          chantierId,
          type,
          amount: Number(amount),
          paymentMode,
          category,
          description,
          personOrSupplier,
          submit: true,
        });
      }}>
        <Field label="Type"><Select onChange={(event) => setType(event.target.value as TransactionType)} value={type}><option value="debit">debit</option><option value="credit">credit</option></Select></Field>
        <Field label="Montant"><Input inputMode="decimal" onChange={(event) => setAmount(event.target.value)} required type="number" value={amount} /></Field>
        <Field label="Mode"><Select onChange={(event) => setPaymentMode(event.target.value as PaymentMode)} value={paymentMode}>{["especes_omotal", "banque_omotal", "especes_etp", "autre"].map((item) => <option key={item} value={item}>{item}</option>)}</Select></Field>
        <Field label="Categorie"><Select onChange={(event) => setCategory(event.target.value as TransactionCategory)} value={category}>{["personnel", "gasoil", "matieres", "location_engins", "entretien", "transport", "etp", "frais_generaux", "financement", "divers"].map((item) => <option key={item} value={item}>{item}</option>)}</Select></Field>
        <Field label="Description"><Input onChange={(event) => setDescription(event.target.value)} required value={description} /></Field>
        <Field label="Personne/Fournisseur"><Input onChange={(event) => setPersonOrSupplier(event.target.value)} value={personOrSupplier} /></Field>
        <div className="flex items-end"><Button disabled={mutation.isPending} type="submit">Enregistrer transaction</Button></div>
        <div className="md:col-span-4"><FormMessage error={mutation.error} success={mutation.isSuccess} /></div>
      </form>
    </Card>
  );
}

export function GasoilEntryForm() {
  const mutation = useCreateGasoilEntry();
  const chantierId = useAppStore((state) => state.selectedChantierId);
  const { data: suppliers = [] } = useFournisseurs();
  const stationSuppliers = suppliers.filter((supplier) => supplier.type === "station");
  const [supplierId, setSupplierId] = useState("");
  const [liters, setLiters] = useState("");
  const [unitPrice, setUnitPrice] = useState("11.8");
  const [receiptNumber, setReceiptNumber] = useState("");

  return (
    <Card className="mb-6 p-4">
      <form className="grid gap-3 md:grid-cols-5" onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate({ date: today(), chantierId, supplierId, liters: Number(liters), unitPrice: Number(unitPrice), receiptNumber, submit: true });
      }}>
        <Field label="Station"><Select onChange={(event) => setSupplierId(event.target.value)} required value={supplierId}><option value="">Choisir</option>{stationSuppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</Select></Field>
        <Field label="Litres"><Input inputMode="decimal" onChange={(event) => setLiters(event.target.value)} required type="number" value={liters} /></Field>
        <Field label="Prix/L"><Input inputMode="decimal" onChange={(event) => setUnitPrice(event.target.value)} required type="number" value={unitPrice} /></Field>
        <Field label="BR"><Input onChange={(event) => setReceiptNumber(event.target.value)} value={receiptNumber} /></Field>
        <div className="flex items-end"><Button disabled={mutation.isPending} type="submit">Ajouter entree</Button></div>
        <div className="md:col-span-5"><FormMessage error={mutation.error} success={mutation.isSuccess} /></div>
      </form>
    </Card>
  );
}

export function EquipmentForm() {
  const mutation = useCreateEquipment();
  const chantierId = useAppStore((state) => state.selectedChantierId);
  const [designation, setDesignation] = useState("");
  const [type, setType] = useState<Equipment["type"]>("pelle");
  const [owner, setOwner] = useState("");
  const [billingMode, setBillingMode] = useState<BillingMode>("heure");
  const [hourlyRate, setHourlyRate] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [usualDriver, setUsualDriver] = useState("");

  return (
    <Card className="mb-6 p-4">
      <form className="grid gap-3 md:grid-cols-4" onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate({ designation, type, owner, chantierId, billingMode, hourlyRate: hourlyRate ? Number(hourlyRate) : undefined, dailyRate: dailyRate ? Number(dailyRate) : undefined, usualDriver });
      }}>
        <Field label="Designation"><Input onChange={(event) => setDesignation(event.target.value)} required value={designation} /></Field>
        <Field label="Type"><Select onChange={(event) => setType(event.target.value as Equipment["type"])} value={type}>{["pelle", "niveleuse", "tractopelle", "camion", "tombereau", "vehicule", "compacteur", "autre"].map((item) => <option key={item} value={item}>{item}</option>)}</Select></Field>
        <Field label="Proprietaire"><Input onChange={(event) => setOwner(event.target.value)} required value={owner} /></Field>
        <Field label="Facturation"><Select onChange={(event) => setBillingMode(event.target.value as BillingMode)} value={billingMode}>{["heure", "jour", "forfait", "interne"].map((item) => <option key={item} value={item}>{item}</option>)}</Select></Field>
        <Field label="Tarif heure"><Input inputMode="decimal" onChange={(event) => setHourlyRate(event.target.value)} type="number" value={hourlyRate} /></Field>
        <Field label="Tarif jour"><Input inputMode="decimal" onChange={(event) => setDailyRate(event.target.value)} type="number" value={dailyRate} /></Field>
        <Field label="Chauffeur"><Input onChange={(event) => setUsualDriver(event.target.value)} value={usualDriver} /></Field>
        <div className="flex items-end"><Button disabled={mutation.isPending} type="submit">Creer engin</Button></div>
        <div className="md:col-span-4"><FormMessage error={mutation.error} success={mutation.isSuccess} /></div>
      </form>
    </Card>
  );
}

export function EquipmentTimesheetForm() {
  const mutation = useCreateEquipmentTimesheet();
  const chantierId = useAppStore((state) => state.selectedChantierId);
  const { data } = useEngins();
  const equipment = useMemo(() => data?.equipment ?? [], [data?.equipment]);
  const [equipmentId, setEquipmentId] = useState("");
  const selected = useMemo(() => equipment.find((item) => item.id === equipmentId), [equipment, equipmentId]);
  const [driver, setDriver] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [daysBilled, setDaysBilled] = useState("");
  const [activityType, setActivityType] = useState<EquipmentTimesheet["activityType"]>("production");

  return (
    <Card className="mb-6 p-4">
      <form className="grid gap-3 md:grid-cols-5" onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate({ date: today(), chantierId, equipmentId, driver: driver || selected?.usualDriver || "", hoursWorked: hoursWorked ? Number(hoursWorked) : undefined, daysBilled: daysBilled ? Number(daysBilled) : undefined, activityType, submit: true });
      }}>
        <Field label="Engin"><Select onChange={(event) => setEquipmentId(event.target.value)} required value={equipmentId}><option value="">Choisir</option>{equipment.map((item) => <option key={item.id} value={item.id}>{item.designation}</option>)}</Select></Field>
        <Field label="Chauffeur"><Input onChange={(event) => setDriver(event.target.value)} placeholder={selected?.usualDriver} value={driver} /></Field>
        <Field label="Heures"><Input inputMode="decimal" onChange={(event) => setHoursWorked(event.target.value)} type="number" value={hoursWorked} /></Field>
        <Field label="Jours"><Input inputMode="decimal" onChange={(event) => setDaysBilled(event.target.value)} type="number" value={daysBilled} /></Field>
        <Field label="Activite"><Select onChange={(event) => setActivityType(event.target.value as EquipmentTimesheet["activityType"])} value={activityType}>{["production", "reglage", "attente", "panne", "transport", "autre"].map((item) => <option key={item} value={item}>{item}</option>)}</Select></Field>
        <div className="md:col-span-5"><Button disabled={mutation.isPending} type="submit">Soumettre pointage engin</Button></div>
        <div className="md:col-span-5"><FormMessage error={mutation.error} success={mutation.isSuccess} /></div>
      </form>
    </Card>
  );
}

export function EmployeeForm() {
  const mutation = useCreateEmployee();
  const chantierId = useAppStore((state) => state.selectedChantierId);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [remunerationType, setRemunerationType] = useState<RemunerationType>("jour");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [dailySalary, setDailySalary] = useState("");
  const [hourlySalary, setHourlySalary] = useState("");

  return (
    <Card className="mb-6 p-4">
      <form className="grid gap-3 md:grid-cols-4" onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate({ firstName, lastName, position, chantierId, remunerationType, monthlySalary: monthlySalary ? Number(monthlySalary) : undefined, dailySalary: dailySalary ? Number(dailySalary) : undefined, hourlySalary: hourlySalary ? Number(hourlySalary) : undefined });
      }}>
        <Field label="Prenom"><Input onChange={(event) => setFirstName(event.target.value)} required value={firstName} /></Field>
        <Field label="Nom"><Input onChange={(event) => setLastName(event.target.value)} required value={lastName} /></Field>
        <Field label="Poste"><Input onChange={(event) => setPosition(event.target.value)} required value={position} /></Field>
        <Field label="Type"><Select onChange={(event) => setRemunerationType(event.target.value as RemunerationType)} value={remunerationType}>{["heure", "jour", "mois"].map((item) => <option key={item} value={item}>{item}</option>)}</Select></Field>
        <Field label="Salaire mois"><Input inputMode="decimal" onChange={(event) => setMonthlySalary(event.target.value)} type="number" value={monthlySalary} /></Field>
        <Field label="Salaire jour"><Input inputMode="decimal" onChange={(event) => setDailySalary(event.target.value)} type="number" value={dailySalary} /></Field>
        <Field label="Salaire heure"><Input inputMode="decimal" onChange={(event) => setHourlySalary(event.target.value)} type="number" value={hourlySalary} /></Field>
        <div className="flex items-end"><Button disabled={mutation.isPending} type="submit">Creer employe</Button></div>
        <div className="md:col-span-4"><FormMessage error={mutation.error} success={mutation.isSuccess} /></div>
      </form>
    </Card>
  );
}

export function PersonnelTimesheetForm() {
  const mutation = useCreatePersonnelTimesheet();
  const chantierId = useAppStore((state) => state.selectedChantierId);
  const { data } = usePersonnel();
  const [employeeId, setEmployeeId] = useState("");
  const [hoursWorked, setHoursWorked] = useState("9");
  const [dayType, setDayType] = useState<DayType>("normal");

  return (
    <Card className="mb-6 p-4">
      <form className="grid gap-3 md:grid-cols-4" onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate({ date: today(), chantierId, employeeId, hoursWorked: Number(hoursWorked), dayType, submit: true });
      }}>
        <Field label="Employe"><Select onChange={(event) => setEmployeeId(event.target.value)} required value={employeeId}><option value="">Choisir</option>{(data?.employees ?? []).map((item) => <option key={item.id} value={item.id}>{item.firstName} {item.lastName}</option>)}</Select></Field>
        <Field label="Heures"><Input inputMode="decimal" onChange={(event) => setHoursWorked(event.target.value)} required type="number" value={hoursWorked} /></Field>
        <Field label="Journee"><Select onChange={(event) => setDayType(event.target.value as DayType)} value={dayType}>{["normal", "absence", "conge", "arret", "demi_journee"].map((item) => <option key={item} value={item}>{item}</option>)}</Select></Field>
        <div className="flex items-end"><Button disabled={mutation.isPending} type="submit">Valider pointage</Button></div>
        <div className="md:col-span-4"><FormMessage error={mutation.error} success={mutation.isSuccess} /></div>
      </form>
    </Card>
  );
}
