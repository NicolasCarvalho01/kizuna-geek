import { Hero } from "@/components/sections/hero";
import { PreOrderMarquee } from "@/components/sections/pre-order-marquee";
import { Categories } from "@/components/sections/categories";
import { EditorialPicks } from "@/components/sections/editorial-picks";
import { TcgSpotlight } from "@/components/sections/tcg-spotlight";
import { BondStatement } from "@/components/sections/bond-statement";
import { Newsletter } from "@/components/sections/newsletter";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/components/seo/json-ld";
import { getFeaturedProducts, getProductsByType } from "@/server/queries/products";

export default async function HomePage() {
  const [editorialPicks, tcgPicks] = await Promise.all([
    getFeaturedProducts(4),
    getProductsByType("TCG_SINGLE", 4),
  ]);

  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <Hero />
      <PreOrderMarquee />
      <Categories />
      <EditorialPicks products={editorialPicks} />
      <TcgSpotlight products={tcgPicks} />
      <BondStatement />
      <Newsletter />
    </>
  );
}
