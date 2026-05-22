import { NextResponse } from "next/server";

import { getAdminClient } from "@/lib/supabase/admin";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\-\s\d]{7,20}$/;

type ContactMessagePayload = {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactMessagePayload;
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, phone number, topic, and message are required." },
        { status: 400 },
      );
    }

    if (name.length < 2 || name.length > 120) {
      return NextResponse.json({ error: "Please enter a valid name." }, { status: 400 });
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!phonePattern.test(phone)) {
      return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
    }

    if (subject.length < 2 || subject.length > 120) {
      return NextResponse.json({ error: "Please choose a valid topic." }, { status: 400 });
    }

    if (message.length < 10 || message.length > 3000) {
      return NextResponse.json(
        { error: "Message must be between 10 and 3000 characters." },
        { status: 400 },
      );
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        phone,
        subject,
        message,
      })
      .select("id, created_at")
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json(
      { message: "Message submitted successfully.", contactMessage: data },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error submitting contact message:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit message." },
      { status: 500 },
    );
  }
}
