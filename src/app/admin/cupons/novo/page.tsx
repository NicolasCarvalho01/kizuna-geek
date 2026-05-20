import { Eyebrow } from "@/components/ui/eyebrow";
import { PageBack } from "@/components/shared/page-back";
import { CouponForm } from "@/components/admin/coupon-form";

export const metadata = { title: "Novo cupom · Admin" };

export default function NewCouponPage() {
  return (
    <div className="space-y-6">
      <header>
        <PageBack fallback="/admin/cupons" label="Voltar pra cupons" className="mb-5" />
        <Eyebrow index="—">Cupons</Eyebrow>
        <h1 className="display mt-3 text-[clamp(1.75rem,3vw,2.5rem)]">
          Novo cupom
        </h1>
      </header>
      <CouponForm couponId={null} />
    </div>
  );
}
