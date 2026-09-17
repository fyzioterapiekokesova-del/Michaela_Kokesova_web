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
      <div className="bg-plocha flex min-h-full flex-col">{children}</div>
    </>
  );
}
