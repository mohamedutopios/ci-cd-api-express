const express = require('express');
const app = express();

app.use(express.json());

// Version de l'API
const API_VERSION = '/v2';

// Jeu de données
let users = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', age: 30, role: 'admin' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', age: 25, role: 'user' },
  { id: 3, name: 'Alice Brown', email: 'alice.brown@example.com', age: 35, role: 'user' },
  { id: 4, name: 'Bob Green', email: 'bob.green@example.com', age: 40, role: 'manager' },
];

// Jeu de données liés (exemple : commandes pour les utilisateurs)
let orders = [
  { id: 1, userId: 1, total: 120.5, date: '2025-01-20' },
  { id: 2, userId: 1, total: 45.0, date: '2025-01-15' },
  { id: 3, userId: 2, total: 89.99, date: '2025-01-18' },
];

// Endpoint pour récupérer tous les utilisateurs avec `include` et autres paramètres
app.get(`${API_VERSION}/users`, (req, res) => {
  let { include, fields, role, page, limit } = req.query;

  let result = [...users];

  // Filtrage par rôle
  if (role) {
    result = result.filter((user) => user.role === role);
  }

  // Pagination
  page = parseInt(page, 10) || 1;
  limit = parseInt(limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = result.length;

  result = result.slice(startIndex, endIndex);

  // Réponses partielles (sélection des champs)
  if (fields) {
    const fieldList = fields.split(','); // Exemple : 'id,name,email'
    result = result.map((user) =>
      Object.fromEntries(Object.entries(user).filter(([key]) => fieldList.includes(key)))
    );
  }

  // Inclure les relations
  if (include === 'orders') {
    result = result.map((user) => ({
      ...user,
      orders: orders.filter((order) => order.userId === user.id),
    }));
  }

  res.status(200).json({
    success: true,
    total,
    page,
    limit,
    data: result,
  });
});

// Endpoint pour récupérer un utilisateur spécifique avec `include`
app.get(`${API_VERSION}/users/:id`, (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { include } = req.query;

  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  let result = { ...user };

  // Inclure les relations
  if (include === 'orders') {
    result.orders = orders.filter((order) => order.userId === user.id);
  }

  res.status(200).json({
    success: true,
    data: result,
  });
});

// Endpoint pour ajouter un utilisateur
app.post(`${API_VERSION}/users`, (req, res) => {
  const { id, name, email, age, role } = req.body;

  if (!id || !name || !email || !age || !role) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: id, name, email, age, role',
    });
  }

  if (users.find((u) => u.id === id)) {
    return res.status(409).json({
      success: false,
      message: 'User with the given ID already exists',
    });
  }

  const newUser = { id, name, email, age, role };
  users.push(newUser);

  res.status(201).json({
    success: true,
    data: newUser,
  });
});

// Endpoint pour mettre à jour un utilisateur
app.put(`${API_VERSION}/users/:id`, (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { name, email, age, role } = req.body;

  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (age) user.age = age;
  if (role) user.role = role;

  res.status(200).json({
    success: true,
    data: user,
  });
});

// Endpoint pour supprimer un utilisateur
app.delete(`${API_VERSION}/users/:id`, (req, res) => {
  const userId = parseInt(req.params.id, 10);

  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  users.splice(userIndex, 1);

  res.status(204).send(); // Suppression réussie
});

// Lancement du serveur
app.listen(3000, () => {
  console.log(`API ${API_VERSION} is running on http://localhost:3000`);
});
