export const site = {
  name: "Erll",
  title: "Erll — Web and app developer",
  description: "Web and app projects built around real business needs. Portfolio of Erll, a fourth-year graduating BSIT student majoring in Service Management.",
  url: process.env.APP_URL ?? "http://localhost:3000",
};

export const navItems = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/resume", label: "Résumé" },
  { href: "/contact", label: "Contact" },
];
