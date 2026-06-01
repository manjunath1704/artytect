import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import CartContent from "./cart-content";

export default function CartPage() {
  return (
    <>
      <Navbar transparentTone="dark" />
      <CartContent />
      <Footer />
    </>
  );
}
