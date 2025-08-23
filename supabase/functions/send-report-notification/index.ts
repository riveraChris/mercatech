import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface ReportData {
  id: string;
  reporter_id: string;
  listing_id: string;
  reason: string;
  description?: string;
  created_at: string;
  listing: {
    title: string;
    price: number;
    user_id: string;
  };
  reporter: {
    display_name: string;
  };
}

const ADMIN_EMAIL = "admin@mercatech-pr.com"; // Replace with actual admin email
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

Deno.serve(async (req: Request) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const reportData: ReportData = await req.json();

    // Validate required data
    if (!reportData.id || !reportData.listing || !reportData.reporter) {
      return new Response(JSON.stringify({ error: 'Missing required data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if Resend API key is configured
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Format price
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('es-PR', {
        style: 'currency',
        currency: 'USD'
      }).format(price);
    };

    // Create email content
    const emailSubject = `🚨 Nuevo Reporte - ${reportData.listing.title}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">MercaTech - Nuevo Reporte</h1>
        </div>
        
        <div style="padding: 20px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-top: 0;">Detalles del Reporte</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #dc2626; margin-top: 0;">Razón: ${reportData.reason}</h3>
            ${reportData.description ? `<p><strong>Descripción:</strong> ${reportData.description}</p>` : ''}
            <p><strong>Fecha:</strong> ${new Date(reportData.created_at).toLocaleString('es-PR')}</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-top: 0;">Publicación Reportada</h3>
            <p><strong>Título:</strong> ${reportData.listing.title}</p>
            <p><strong>Precio:</strong> ${formatPrice(reportData.listing.price)}</p>
            <p><strong>ID de Publicación:</strong> ${reportData.listing_id}</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-top: 0;">Reportado por</h3>
            <p><strong>Usuario:</strong> ${reportData.reporter.display_name}</p>
            <p><strong>ID de Usuario:</strong> ${reportData.reporter_id}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://mercatech-pr.netlify.app/listing/${reportData.listing_id}" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ver Publicación
            </a>
          </div>
        </div>
        
        <div style="background: #374151; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
          <p>Este es un email automático del sistema de reportes de MercaTech.</p>
          <p>ID del Reporte: ${reportData.id}</p>
        </div>
      </div>
    `;

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'MercaTech <noreply@mercatech-pr.com>',
        to: [ADMIN_EMAIL],
        subject: emailSubject,
        html: emailHtml
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('Resend API error:', errorData);
      throw new Error(`Email service error: ${emailResponse.status}`);
    }

    const emailResult = await emailResponse.json();
    console.log('Email sent successfully:', emailResult);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Report notification sent successfully',
      emailId: emailResult.id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error sending report notification:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to send notification',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
