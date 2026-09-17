import type { Metadata } from "next";
import { StrankaTextu } from "@/komponenty/stranka-textu";
import { nactiObsah } from "@/lib/obsah";
import { textNeboNic } from "@/lib/obsah/cteni";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Zásady cookies — Michaela Kokešová",
};

export default async function Stranka() {
  const pravni = await nactiObsah("pravni");
  return <StrankaTextu nadpis="Zásady cookies" text={textNeboNic(pravni, "cookies")} />;
}
