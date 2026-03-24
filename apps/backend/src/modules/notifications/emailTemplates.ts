type BaseTemplateInput = {
  title: string;
  intro: string;
  bullets?: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  footer?: string;
};

const BASE_APP_URL = 'https://franco.app';

function renderBullets(items: string[]): string {
  if (!items.length) return '';
  return `
    <ul style="margin: 12px 0 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.6;">
      ${items.map((item) => `<li style="margin-bottom: 6px;">${item}</li>`).join('')}
    </ul>
  `;
}

function renderButton(label?: string, url?: string): string {
  if (!label || !url) return '';
  return `
    <a href="${url}" style="
      display:inline-block;
      margin-top:16px;
      padding:10px 16px;
      background:#1E3A8A;
      color:#ffffff;
      text-decoration:none;
      border-radius:10px;
      font-weight:700;
      font-size:14px;
    ">${label}</a>
  `;
}

export function renderNotificationTemplate(input: BaseTemplateInput): string {
  const bullets = renderBullets(input.bullets ?? []);
  const button = renderButton(input.ctaLabel, input.ctaUrl);
  const footer = input.footer ?? 'Franco • Structured Canadian French Training';

  return `
  <div style="background:#F8FAFC;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #E2E8F0;border-radius:14px;overflow:hidden;">
      <div style="background:#1E3A8A;color:#ffffff;padding:16px 20px;font-size:18px;font-weight:800;">
        ${input.title}
      </div>
      <div style="padding:18px 20px;">
        <p style="margin:0;color:#0F172A;font-size:15px;line-height:1.7;">${input.intro}</p>
        ${bullets}
        ${button}
      </div>
      <div style="border-top:1px solid #E2E8F0;padding:12px 20px;color:#64748B;font-size:12px;">
        ${footer}
      </div>
    </div>
  </div>`;
}

export function appUrl(path = ''): string {
  return `${BASE_APP_URL}${path}`;
}
