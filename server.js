const express = require('express');
const app = express();
const PORT = 8080;

// Middleware สำหรับแปลง JSON
app.use(express.json());

// Mock Database
let items = [
  { id: 1, name: 'Item1', price: 100 },
  { id: 2, name: 'Item2', price: 200 },
];

// Route: ดึงข้อมูลทั้งหมด
app.get('/items', (req, res) => {
  res.json(items);
});

// Route: ดึงข้อมูลโดย ID
app.get('/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = items.find((i) => i.id === id);
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

// Route: เพิ่มข้อมูลใหม่
app.post('/items', (req, res) => {
  const { name, price } = req.body;
  const newItem = {
    id: items.length + 1,
    name,
    price,
  };
  items.push(newItem);
  res.status(201).json(newItem);
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
