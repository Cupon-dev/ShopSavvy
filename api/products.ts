export default function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const products = [
    {
      id: 1,
      name: "Premium Web Templates",
      brand: "DesignPro",
      description: "Professional website templates",
      price: "99.00",
      category: "templates",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300",
      razorpayLink: "https://rzp.io/l/sample1"
    },
    {
      id: 2,
      name: "Digital Marketing Course", 
      brand: "EduTech",
      description: "Complete digital marketing guide",
      price: "149.00",
      category: "course",
      imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300",
      razorpayLink: "https://rzp.io/l/sample2"
    }
  ];
  
  res.status(200).json(products);
}
