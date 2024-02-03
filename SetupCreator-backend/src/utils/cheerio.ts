import cheerio from "cheerio";

export const scrapProductDetails = async (ceneoId: string) => {
  const req = await fetch(`https://www.ceneo.pl/${ceneoId}`);
  const html = await req.text();

  const page = cheerio.load(html);
  const priceMetaVal = page('meta[property="product:price:amount"]')?.attr(
    "content"
  );
  const imageMetaVal = page('meta[property="og:image"]')?.attr("content");

  const price = priceMetaVal ? parseInt(priceMetaVal) * 100 : null;
  const image = imageMetaVal ? imageMetaVal : null;

  const summaryShopWrapper = page(".product-offer-summary__shop-logo a");
  const summaryShopUrl = summaryShopWrapper.attr("href");
  const summaryShopImage = summaryShopWrapper.find("img").attr("src");

  return {
    price,
    image,
    summaryShopUrl: `https://www.ceneo.pl${summaryShopUrl}`,
    summaryShopImage: `https:${summaryShopImage}`,
  };
};
