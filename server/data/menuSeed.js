// Sample starter menu. After first boot, manage everything in Admin → Menu.
const u = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`
const naan = { name: 'Butter Naan', price: 45 }
const extra = { name: 'Extra gravy', price: 30 }

export const menuSeed = [
    // Starters
    { name: 'Paneer Tikka', category: 'Starters', price: 289, isVeg: true, isBestseller: true, description: 'Charred cottage cheese cubes marinated in hung curd and spices.', image: u('photo-1599487488170-d11ec9c172f0'), addons: [{ name: 'Extra mint chutney', price: 15 }] },
    { name: 'Chicken Tikka', category: 'Starters', price: 329, isVeg: false, description: 'Tender chicken, yoghurt-spice marinade, finished in the tandoor.', image: u('photo-1610057099443-fde8c4d50f91'), addons: [] },
    { name: 'Hara Bhara Kebab', category: 'Starters', price: 249, isVeg: true, description: 'Spinach, peas and potato patties, pan-seared until crisp.', image: u('photo-1606491956689-2ea866880c84'), addons: [] },
    { name: 'Amritsari Fish Fry', category: 'Starters', price: 359, isVeg: false, description: 'Crisp gram-flour battered fish with ajwain and lemon.', image: u('photo-1535399831218-d5bd36d1a6b3'), addons: [] },
    // North Indian
    { name: 'Butter Chicken', category: 'North Indian', price: 369, isVeg: false, isBestseller: true, description: 'Tandoori chicken in a silky tomato-butter gravy.', image: u('photo-1603894584373-5ac82b2ae398'), addons: [naan, extra] },
    { name: 'Dal Makhani', category: 'North Indian', price: 289, isVeg: true, description: 'Black lentils slow-cooked overnight with cream and butter.', image: u('photo-1546833999-b9f581a1996d'), addons: [naan, extra] },
    { name: 'Kadai Paneer', category: 'North Indian', price: 319, isVeg: true, description: 'Paneer with capsicum in a bold, freshly ground kadai masala.', image: u('photo-1567188040759-fb8a883dc6d8'), addons: [naan, extra] },
    { name: 'Rogan Josh', category: 'North Indian', price: 429, isVeg: false, description: 'Kashmiri-style mutton curry, deep red and aromatic.', image: u('photo-1545247181-516773cae754'), addons: [naan, extra] },
    // Biryani
    { name: 'Hyderabadi Chicken Dum Biryani', category: 'Biryani', price: 349, isVeg: false, isBestseller: true, description: 'Layered basmati and marinated chicken, sealed and steamed on dum.', image: u('photo-1563379091339-03b21ab4a4f8'), addons: [{ name: 'Raita', price: 30 }, { name: 'Boiled egg', price: 20 }] },
    { name: 'Veg Dum Biryani', category: 'Biryani', price: 289, isVeg: true, description: 'Seasonal vegetables, saffron rice, fried onions and mint.', image: u('photo-1642821373181-696a54913e93'), addons: [{ name: 'Raita', price: 30 }] },
    { name: 'Mutton Biryani', category: 'Biryani', price: 459, isVeg: false, description: 'Slow-cooked mutton with long-grain rice and whole spices.', image: u('photo-1589302168068-964664d93dc0'), addons: [{ name: 'Raita', price: 30 }] },
    { name: 'Paneer Tikka Biryani', category: 'Biryani', price: 329, isVeg: true, description: 'Smoky tikka pieces folded into fragrant dum rice.', image: u('photo-1633945274405-b6c8069047b0'), addons: [{ name: 'Raita', price: 30 }] },
    // Street Food
    { name: 'Pani Puri', category: 'Street Food', price: 99, isVeg: true, isBestseller: true, description: 'Crisp puris, spiced potato and tangy mint water.', image: u('photo-1626132647523-66f5bf380027'), addons: [] },
    { name: 'Samosa Chaat', category: 'Street Food', price: 129, isVeg: true, description: 'Crushed samosa, chickpeas, yoghurt and chutneys.', image: u('photo-1601050690597-df0568f70950'), addons: [] },
    { name: 'Pav Bhaji', category: 'Street Food', price: 179, isVeg: true, isBestseller: true, description: 'Buttery mashed vegetable bhaji with toasted pav.', image: u('photo-1606491048802-8342506d6471'), addons: [{ name: 'Extra pav', price: 25 }, { name: 'Extra butter', price: 20 }] },
    { name: 'Vada Pav', category: 'Street Food', price: 69, isVeg: true, description: 'Mumbai-style spiced potato fritter in a soft bun.', image: u('photo-1606491956689-2ea866880c84'), addons: [] },
    // Beverages
    { name: 'Mango Lassi', category: 'Beverages', price: 119, isVeg: true, description: 'Thick yoghurt blended with ripe mango.', image: u('photo-1571934811356-5cc061b6821f'), addons: [] },
    { name: 'Masala Chai', category: 'Beverages', price: 59, isVeg: true, description: 'Strong tea simmered with ginger and cardamom.', image: u('photo-1571934811356-5cc061b6821f'), addons: [] },
    { name: 'Jaljeera', category: 'Beverages', price: 79, isVeg: true, description: 'Cumin-mint cooler with a tangy kick.', image: u('photo-1556679343-c7306c1976bc'), addons: [] },
    { name: 'Sweet Lassi', category: 'Beverages', price: 99, isVeg: true, description: 'Chilled, creamy and lightly sweet.', image: u('photo-1571934811356-5cc061b6821f'), addons: [] },
    // Desserts
    { name: 'Gulab Jamun (2 pcs)', category: 'Desserts', price: 109, isVeg: true, isBestseller: true, description: 'Warm khoya dumplings in rose-cardamom syrup.', image: u('photo-1571877227200-a0d98ea607e9'), addons: [{ name: 'Scoop of ice cream', price: 40 }] },
    { name: 'Rasmalai', category: 'Desserts', price: 149, isVeg: true, description: 'Soft paneer discs in chilled saffron milk.', image: u('photo-1666190092689-e3968aa0c32c'), addons: [] },
    { name: 'Kulfi Falooda', category: 'Desserts', price: 169, isVeg: true, description: 'Dense malai kulfi with falooda and rose syrup.', image: u('photo-1488900128323-21503983a07e'), addons: [] },
    { name: 'Gajar Halwa', category: 'Desserts', price: 139, isVeg: true, description: 'Slow-cooked carrot halwa with nuts.', image: u('photo-1589301760014-d929f3979dbc'), addons: [] },
]