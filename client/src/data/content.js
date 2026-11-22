const u = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const content = {
    hero: u('photo-1585937421612-70a008356fbe', 1600),
    heroInset: u('photo-1606491956689-2ea866880c84', 700),
    promo: u('photo-1596797038530-2c107229654b', 1600),
    story: [u('photo-1589302168068-964664d93dc0', 1000), u('photo-1626132647523-66f5bf380027', 800)],
    categories: [
        { name: 'Starters', image: u('photo-1599487488170-d11ec9c172f0', 800) },
        { name: 'North Indian', image: u('photo-1603894584373-5ac82b2ae398', 800) },
        { name: 'Biryani', image: u('photo-1563379091339-03b21ab4a4f8', 800) },
        { name: 'Street Food', image: u('photo-1606491048802-8342506d6471', 800) },
        { name: 'Beverages', image: u('photo-1571934811356-5cc061b6821f', 800) },
        { name: 'Desserts', image: u('photo-1571877227200-a0d98ea607e9', 800) },
    ],
    // DEMO testimonials — replace with genuine customer reviews.
    reviews: [
        { name: 'Aarav K.', rating: 5, text: 'The butter chicken tasted like it was made at home, and it arrived hot. Pav bhaji was just as good.' },
        { name: 'Meera S.', rating: 5, text: 'Ordered biryani for a family lunch. Generous portions, great aroma and the packaging held up well.' },
        { name: 'Imran Q.', rating: 4, text: 'Pani puri and chaat were fresh and punchy. Delivery took a little longer than quoted, but worth it.' },
    ],
    gallery: [
        { src: u('photo-1585937421612-70a008356fbe', 900), alt: 'Curry in a copper bowl', ratio: 'aspect-[4/5]' },
        { src: u('photo-1555939594-58d7cb561ad1', 900), alt: 'Grilled skewers', ratio: 'aspect-square' },
        { src: u('photo-1563379091339-03b21ab4a4f8', 900), alt: 'Biryani', ratio: 'aspect-[4/3]' },
        { src: u('photo-1606491956689-2ea866880c84', 900), alt: 'Fresh samosas', ratio: 'aspect-[3/4]' },
        { src: u('photo-1517248135467-4c7edcad34c4', 900), alt: 'Restaurant interior', ratio: 'aspect-[4/3]' },
        { src: u('photo-1556910103-1c02745aae4d', 900), alt: 'Chef at work', ratio: 'aspect-[4/5]' },
        { src: u('photo-1571877227200-a0d98ea607e9', 900), alt: 'Gulab jamun', ratio: 'aspect-square' },
        { src: u('photo-1571934811356-5cc061b6821f', 900), alt: 'Lassi and chai', ratio: 'aspect-[4/3]' },
    ],
}