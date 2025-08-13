// Giá gói mua points
const POINTS_PACKAGES = [
  { id: 'p1', points: 1000, price: 2 },
  { id: 'p2', points: 5000, price: 8.5 },
  { id: 'p3', points: 10000, price: 15 },
  { id: 'p4', points: 50000, price: 60 },
  { id: 'p5', points: 100000, price: 90 },
  { id: 'p6', points: 500000, price: 300 },
];

const getPackageById = (id) => POINTS_PACKAGES.find(pkg => pkg.id === id);

module.exports = {
  POINTS_PACKAGES,
  getPackageById
};
