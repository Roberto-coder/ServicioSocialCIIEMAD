export async function post({ request }) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let payload;

    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else {
      const form = await request.formData();
      payload = Object.fromEntries(form.entries());
    }

    const { nombre, email, asunto, mensaje } = payload || {};

    // Basic validation
    if (!nombre || !email || !asunto || !mensaje) {
      return new Response(JSON.stringify({ error: 'Campos incompletos' }), { status: 400 });
    }

    const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
    const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'no-reply@example.com';
    const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'quintana.romero.roberto@gmail.com';

    if (!SENDGRID_KEY) {
      return new Response(JSON.stringify({ error: 'Configuración de servidor incompleta' }), { status: 500 });
    }

    const body = {
      personalizations: [
        {
          to: [{ email: TO_EMAIL }],
        },
      ],
      from: { email: FROM_EMAIL, name: 'SUSTENTA-LAPP (Formulario web)' },
      subject: `${asunto} — Formulario de contacto`,
      content: [
        {
          type: 'text/plain',
          value: `Nombre: ${nombre}\nEmail: ${email}\n\nMensaje:\n${mensaje}`,
        },
      ],
    };

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: 'Error al enviar correo', detail: text }), { status: 502 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
