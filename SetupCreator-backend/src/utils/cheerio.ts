import cheerio, { Cheerio, CheerioAPI } from "cheerio";

interface ProductDetails {
  price: number | null;
  image: string | null;
  summaryShopUrl: string;
  summaryShopImage: string;
}

export const scrapProductDetails = async (
  ceneoId: string
): Promise<ProductDetails> => {
  const req: Response = await fetch(`https://www.ceneo.pl/${ceneoId}`);
  const html: string = await req.text();

  const page: CheerioAPI = cheerio.load(html);
  const priceMetaVal: string | undefined = page(
    'meta[property="product:price:amount"]'
  )?.attr("content");
  const imageMetaVal: string | undefined = page(
    'meta[property="og:image"]'
  )?.attr("content");

  const price: number | null = priceMetaVal
    ? parseInt(priceMetaVal) * 100
    : null;
  const image: string | null = imageMetaVal ? imageMetaVal : null;

  const summaryShopWrapper: Cheerio<any> = page(
    ".product-offer-summary__shop-logo a"
  );

  const summaryShopUrl: string | undefined = summaryShopWrapper.attr("href");
  const summaryShopImage: string | undefined = summaryShopWrapper
    .find("img")
    .attr("src");

  return {
    price,
    image,
    summaryShopUrl: `https://www.ceneo.pl${summaryShopUrl}`,
    summaryShopImage: `https:${summaryShopImage}`,
  };
};
