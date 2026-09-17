import { RamWebu } from "@/komponenty/ram-webu";

/**
 * Layout veřejné části webu.
 *
 * Administrace je mimo tuhle skupinu, takže nemá hlavičku, patičku ani lištu
 * se souhlasem — v administraci se nic neměří a menu webu tam nepatří.
 */
export default function WebLayout({ children }: LayoutProps<"/">) {
  return <RamWebu>{children}</RamWebu>;
}
