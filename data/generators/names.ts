import { pickRandom } from "@/lib/random";

export type NameGender = "male" | "female";

export interface NameTable {
  culture: string;
  label: string;
  male: string[];
  female: string[];
  surnames: string[];
}

export const NAME_TABLES: NameTable[] = [
  {
    culture: "humano",
    label: "Humano",
    male: ["Aldric", "Borin", "Cedric", "Darian", "Edric", "Garran", "Lucan", "Tomas"],
    female: ["Alina", "Brina", "Celia", "Elara", "Helena", "Mara", "Seren", "Ysabel"],
    surnames: ["Valen", "Cortazar", "Hierro", "Rios", "Montegris", "Luzalta", "Vargas", "Espino"],
  },
  {
    culture: "elfo",
    label: "Elfo",
    male: ["Aelar", "Erevan", "Galinndan", "Immeral", "Laucian", "Paelias", "Riardon", "Theren"],
    female: ["Althaea", "Caelynn", "Enna", "Ielenia", "Lia", "Meriele", "Naivara", "Shava"],
    surnames: ["Amastacia", "Lunargenta", "Rocioluz", "Siannodel", "Galathil", "Ilphelkiir", "Nailo", "Xiloscient"],
  },
  {
    culture: "enano",
    label: "Enano",
    male: ["Adrik", "Baern", "Dain", "Eberk", "Fargrim", "Harbek", "Orsik", "Thorin"],
    female: ["Audhild", "Bardryn", "Dagnal", "Eldeth", "Gunnloda", "Helja", "Riswynn", "Vistra"],
    surnames: ["Martilloro", "Barbahierro", "Yunquefirme", "Piedragrande", "Runacobre", "Ejeprofundo", "Escudonegro", "Bronzefrio"],
  },
  {
    culture: "orco",
    label: "Orco",
    male: ["Brog", "Dorn", "Ghorza", "Karg", "Mauhurr", "Ront", "Shump", "Thokk"],
    female: ["Baggi", "Emen", "Engong", "Kansif", "Myev", "Neega", "Ovak", "Shautha"],
    surnames: ["Rompehuesos", "Colmillo Rojo", "Puño Ceniza", "Garra Negra", "Craneopiedra", "Sangrebrava", "Hierrocrudo", "Muerderroca"],
  },
  {
    culture: "mediano",
    label: "Mediano",
    male: ["Alton", "Cade", "Corrin", "Eldon", "Finnan", "Milo", "Osborn", "Perrin"],
    female: ["Andry", "Bree", "Callie", "Cora", "Euphemia", "Jillian", "Kithri", "Nora"],
    surnames: ["Buenbarril", "Torcetallo", "Hoja Verde", "Bajozano", "Dedalplata", "Ribera", "Manzanal", "Zarzal"],
  },
  {
    culture: "draconiano",
    label: "Draconiano",
    male: ["Arjhan", "Balasar", "Bharash", "Ghesh", "Heskan", "Kriv", "Medrash", "Rhogar"],
    female: ["Akra", "Biri", "Daar", "Farideh", "Harann", "Jheri", "Korinn", "Nala"],
    surnames: ["Clethtinthiallor", "Daardendrian", "Delmirev", "Kepeshkmolik", "Linxakasendalor", "Myastan", "Norixius", "Turnuroth"],
  },
  {
    culture: "tiefling",
    label: "Tiefling",
    male: ["Akmenos", "Barakas", "Damakos", "Ekemon", "Iados", "Kairon", "Leucis", "Mordai"],
    female: ["Akta", "Bryseis", "Criella", "Damaia", "Ea", "Kallista", "Lerissa", "Makaria"],
    surnames: ["Amparo", "Destino", "Dolor", "Esperanza", "Gloria", "Memoria", "Reverencia", "Verdad"],
  },
];

export const CULTURES = NAME_TABLES.map((table) => table.culture);

function tableForCulture(culture: string): NameTable {
  return NAME_TABLES.find((table) => table.culture === culture) ?? NAME_TABLES[0];
}

export function generateName(culture: string, gender: NameGender, seed?: number): string {
  const table = tableForCulture(culture);
  const firstNames = gender === "female" ? table.female : table.male;
  const first = pickRandom(firstNames, seed);
  const surname = pickRandom(table.surnames, seed === undefined ? undefined : seed + 101);
  return `${first} ${surname}`;
}
