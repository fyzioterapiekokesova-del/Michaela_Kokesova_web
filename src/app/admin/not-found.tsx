import Link from "next/link";

/**
 * Nenalezeno uvnitř administrace — typicky adresa sekce, která ve schématu
 * není. Bez tohohle souboru by se ukázala veřejná stránka 404 i s menu
 * webu, což v administraci nedává smysl.
 */
export default function AdminNenalezeno() {
  return (
    <div className="obal flex flex-1 items-center justify-center py-12">
      <div className="bg-povrch border-linka rounded-karta w-full max-w-[34rem] border p-6 lg:p-8">
        <h1 className="text-h3 lg:text-h3-pc">Tuhle sekci tu nemám</h1>
        <p className="mt-4">
          Nejspíš se změnila adresa. Vyberte si prosím sekci znovu z přehledu.
        </p>
        <p className="mt-6">
          <Link href="/admin" className="klik underline">
            ← Zpátky na přehled
          </Link>
        </p>
      </div>
    </div>
  );
}
