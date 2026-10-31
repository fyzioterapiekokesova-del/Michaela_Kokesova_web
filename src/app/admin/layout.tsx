import type { Metadata } from "next";

/**
 * Rám administrace. Nemá menu webu, patičku ani lištu se souhlasem —
 * v administraci se nic neměří a návštěvnická navigace tam nepatří.
 *
 * `noindex` je pojistka navíc: `/admin` zakazuje i robots.txt, ale spoléhat
 * se na jediné opatření se nevyplácí.
 */
export const metadata: Metadata = {
  title: "Správa obsahu — Michaela Kokešová",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <a href="#obsah-adminu" className="skip-link">
        Přejít na hlavní obsah
      </a>
      {/* Administrace je pracovní nástroj, ne web: menší písmo a hustší
          rozložení, ať se do okna vejde víc. Čitelnost pro návštěvníky
          (17 px a víc) se týká webu, ne téhle části. */}
      <div className="bg-plocha flex min-h-full flex-col text-base leading-normal">
        {children}
      </div>
    </>
  );
}
