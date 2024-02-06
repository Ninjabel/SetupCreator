export function convertPrice(price: number | undefined): string | undefined {
    if (!price) return;
    return new Intl.NumberFormat('pl-PL', {style: 'currency', currency: 'PLN'}).format(price / 100);
}
