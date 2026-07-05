import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Provide a dummy fallback key to prevent Vercel build crashes if env vars are missing during build
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

export async function POST(request) {
  try {
    const { to, subject, html } = await request.json();

    if (!process.env.RESEND_API_KEY) {
      console.warn('Resend API Key is missing. Skipping email send.');
      return NextResponse.json({ message: 'Email skipped (no API key)' }, { status: 200 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Hanib Essentials <onboarding@resend.dev>', // Resend test domain
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Email API Error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
