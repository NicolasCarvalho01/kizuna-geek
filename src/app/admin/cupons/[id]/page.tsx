import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PageBack } from "@/components/shared/page-back";
import { CouponForm } from "@/components/admin/coupon-form";

const USE_DB = !!process.env.DATABASE_URL;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCouponPage({ params }: PageProps) {
  const { id } = await params;
  if (!USE_DB) return null;

  const { prisma } = await import("@/lib/prisma");
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) notFound();

  const toDatetimeLocal = (d: Date) => d.toISOString().slice(0, 16);

  return (
    <div className="space-y-6">
      <header>
        <PageBack fallback="/admin/cupons" label="Voltar pra cupons" className="mb-5" />
        <Eyebrow index="—">Cupons</Eyebrow>
        <h1 className="display mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-[var(--font-mono)] not-italic tracking-normal">
          {coupon.code}
        </h1>
        <p className="mt-2 eyebrow">
          {coupon.usedCount} {coupon.usedCount === 1 ? "uso" : "usos"} registrados
        </p>
      </header>

      <CouponForm
        couponId={coupon.id}
        initial={{
          code: coupon.code,
          description: coupon.description ?? "",
          discountType: coupon.discountType,
          discountValue: Number(coupon.discountValue),
          minimumPurchase: coupon.minimumPurchase ? Number(coupon.minimumPurchase) : null,
          maxUses: coupon.maxUses,
          maxUsesPerUser: coupon.maxUsesPerUser,
          startsAt: toDatetimeLocal(coupon.startsAt),
          expiresAt: toDatetimeLocal(coupon.expiresAt),
          isActive: coupon.isActive,
          appliesToPreOrders: coupon.appliesToPreOrders,
        }}
      />
    </div>
  );
}
