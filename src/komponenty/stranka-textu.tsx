import { PrazdnyStav } from "@/komponenty/karty";

/**
 * Prostá textová stránka pro právní dokumenty.
 *
 * Text se vykresluje **jako text, ne jako HTML**. Kdyby se vypisoval jako
 * HTML, dal by se přes administraci na web propašovat skript.
 */
export function StrankaTextu({
  nadpis,
  text,
}: {
  nadpis: string;
  text?: string;
}) {
  const odstavce = text?.split(/\n{2,}/).filter((o) => o.trim() !== "") ?? [];

  return (
    <section className="bg-povrch sekce">
      <div className="obal max-w-[70ch]">
        <h1 className="text-h1 lg:text-h1-pc">{nadpis}</h1>
        {odstavce.length === 0 ? (
          <div className="mt-8">
            <PrazdnyStav>Text tady zatím není. Doplní se před spuštěním webu.</PrazdnyStav>
          </div>
        ) : (
          <div className="text-telo lg:text-telo-pc mt-8 space-y-4">
            {odstavce.map((odstavec, i) => (
              <p key={i} className="whitespace-pre-line">
                {odstavec}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
