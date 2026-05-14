export const whatsappPhone = "918310012623";

export function getWhatsAppUrl(message: string) {
  return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message: string) {
  window.open(getWhatsAppUrl(message), "_blank", "noopener,noreferrer");
}

type ClassMessageInput = {
  title: string;
  price: number;
  duration: string;
};

type ProductMessageInput = {
  name: string;
  price: number;
  category: string;
};

export function formatPrice(price: number) {
  return `₹${price}`;
}

export function getClassBookingMessage(classItem: ClassMessageInput) {
  return [
    "Hello, I am interested in booking this pottery class.",
    "",
    `Class Name: ${classItem.title}`,
    `Price: ${formatPrice(classItem.price)}`,
    `Duration: ${classItem.duration}`,
    "",
    "Please share available slots.",
  ].join("\n");
}

export function getProductOrderMessage(product: ProductMessageInput) {
  return [
    "Hello, I want to order this pottery product.",
    "",
    `Product Name: ${product.name}`,
    `Price: ${formatPrice(product.price)}`,
    `Category: ${product.category.toLowerCase()}`,
    "",
    "Please share ordering details.",
  ].join("\n");
}
