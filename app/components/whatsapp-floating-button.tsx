import { getWhatsAppUrl } from "@/lib/whatsapp";

const message = "Hello ArtyTect, I would like to know more.";

export default function WhatsAppFloatingButton() {
  return (
    <a
      href={getWhatsAppUrl(message)}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with ArtyTect on WhatsApp"
      className="fixed bottom-5 right-5 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_16px_40px_rgba(0,0,0,0.22)] transition hover:scale-105 hover:bg-[#1ebe5d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25d366]"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-7 w-7"
        fill="currentColor"
      >
        <path d="M16.03 3.2A12.73 12.73 0 0 0 5.12 22.5L3.2 29.2l6.88-1.8a12.7 12.7 0 0 0 5.95 1.5h.01A12.85 12.85 0 0 0 28.8 16.1 12.8 12.8 0 0 0 16.03 3.2Zm0 23.53a10.55 10.55 0 0 1-5.38-1.47l-.38-.23-4.08 1.07 1.09-3.97-.25-.41a10.54 10.54 0 1 1 9 5.01Zm5.78-7.9c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.76-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.08-1.11 2.64s1.13 3.07 1.29 3.28c.16.21 2.23 3.4 5.4 4.77.75.32 1.34.52 1.8.66.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.27-.74.27-1.37.19-1.51-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  );
}
