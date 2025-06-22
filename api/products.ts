export default function handler(req: any, res: any) {
  const products = [
    {
      id: 1,
      name: "Premium Web Templates",
      brand: "DesignPro",
      description: "Professional website templates",
      price: "99.00",
      category: "templates",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300"
    },
    {
      id: 2,
      name: "Digital Marketing Course", 
      brand: "EduTech",
      description: "Complete digital marketing guide",
      price: "149.00",
      category: "course",
      imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300"
    }
  ];
  
  res.status(200).json(products);
}
