import Link from "next/link";
import { Plus } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CouponRowActions } from "@/components/admin/coupon-row-actions";
import { formatBRL, formatDate, cn } from "@/lib/utils";

export const metadata = { title: "Cupons · Admin" };

const USE_DB = !!process.env.DATABASE_URL;

export default async function AdminCouponsPage() {
  if (!USE_DB) {
    return <div className="rounded-[var(--radius-lg)] border border-dashed p-10 text-center">Modo demo.</div>;
  }

  const { prisma } = await import("@/lib/prisma");
  const coupons = await prisma.coupon.findMany({
    orderBy: [{ isActive: "desc" }, { expiresAt: "desc" }],
  });

  const now = new Date();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow index="—">Catálogo · cupons</Eyebrow>
          <h1 className="display mt-3 text-[clamp(2rem,4vw,3rem)]">Cupons</h1>
        </div>
        <Button asChild>
          <Link href="/admin/cupons/novo">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Novo cupom
          </Link>
        </Button>
      </header>

      {coupons.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] p-10 text-center">
          <p className="text-[color:var(--color-fg-soft)]">Nenhum cupom cadastrado.</p>
          <Button asChild className="mt-4">
            <Link href="/admin/cupons/novo">Criar primeiro cupom</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[color:var(--color-bg-elevated)] border-b border-[color:var(--color-hairline)]">
              <tr className="text-left">
                <Th>Código</Th>
                <Th>Desconto</Th>
                <Th>Mín. compra</Th>
                <Th>Usos</Th>
                <Th>Validade</Th>
                <Th>Status</Th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--color-hairline)]">
              {coupons.map((c) => {
                const expired = c.expiresAt < now;
                const notStarted = c.startsAt > now;
                const used = c.maxUses ? `${c.usedCount}/${c.maxUses}` : `${c.usedCount}/∞`;
                return (
                  <tr key={c.id}>
                    <Td>
                      <Link
                        href={`/admin/cupons/${c.id}`}
                        className="font-[var(--font-mono)] text-[0.875rem] text-[color:var(--color-fg)] hover:text-[color:var(--color-gold)]"
                      >
                        {c.code}
                      </Link>
                      {c.description && (
                        <p className="text-[10px] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-mute)] truncate max-w-[20rem]">
                          {c.description}
                        </p>
                      )}
                    </Td>
                    <Td>
                      <span className="text-[0.8125rem]">
                        {c.discountType === "PERCENTAGE"
                          ? `${Number(c.discountValue)}%`
                          : c.discountType === "FIXED_AMOUNT"
                            ? formatBRL(Number(c.discountValue))
                            : "Frete grátis"}
                      </span>
                      {!c.appliesToPreOrders && (
                        <p className="text-[10px] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-vermilion)]">
                          sem pré-venda
                        </p>
                      )}
                    </Td>
                    <Td>
                      <span className="text-[0.8125rem] text-[color:var(--color-fg-soft)]">
                        {c.minimumPurchase
                          ? formatBRL(Number(c.minimumPurchase))
                          : "—"}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-[var(--font-mono)] text-[0.8125rem]">{used}</span>
                      <p className="text-[10px] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-mute)]">
                        {c.maxUsesPerUser}/usuário
                      </p>
                    </Td>
                    <Td>
                      <p className="text-[0.8125rem] text-[color:var(--color-fg-soft)]">
                        {formatDate(c.startsAt)}
                      </p>
                      <p className={cn(
                        "eyebrow",
                        expired && "text-[color:var(--color-vermilion)]",
                      )}>
                        até {formatDate(c.expiresAt)}
                      </p>
                    </Td>
                    <Td>
                      {!c.isActive ? (
                        <Badge variant="soft" size="sm">Inativo</Badge>
                      ) : expired ? (
                        <Badge variant="vermilion" size="sm">Expirado</Badge>
                      ) : notStarted ? (
                        <Badge variant="soft" size="sm">Agendado</Badge>
                      ) : (
                        <Badge variant="gold" size="sm">Ativo</Badge>
                      )}
                    </Td>
                    <Td>
                      <CouponRowActions couponId={c.id} couponCode={c.code} />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-[10px] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] font-medium text-[color:var(--color-fg-mute)]">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>;
}
