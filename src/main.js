import { profile } from './profile.js';

const paths = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
  moon: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
  github: '<path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7M15 22v-3.4c.1-1-.3-1.8-.8-2.3 2.7-.3 5.6-1.3 5.6-6A4.7 4.7 0 0 0 18.5 7c.1-.3.6-1.6-.1-3.4 0 0-1.1-.4-3.5 1.3a12 12 0 0 0-6.3 0C6.2 3.2 5.1 3.6 5.1 3.6 4.4 5.4 4.9 6.7 5 7a4.7 4.7 0 0 0-1.3 3.3c0 4.7 2.9 5.7 5.6 6-.4.4-.8 1.1-.8 2.2V22"/>',
  x: '<path d="m4 3 12 18h4L8 3H4Zm0 18 7-8m2-2 7-8"/>',
  wechat: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/>',
  arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  code: '<path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-11-2 14"/>',
  design: '<path d="m12 3 9 9-9 9-9-9 9-9Z"/><path d="m3 12 9 3 9-3M12 3v18"/>',
  life: '<path d="M4 9h13v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Zm13 0h1a3 3 0 1 1 0 6h-1M7 3v2m4-2v2m4-2v2"/>',
};

function icon(name, className = '') {
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}

for (const element of document.querySelectorAll('[data-profile]')) {
  element.textContent = profile[element.dataset.profile];
}
document.title = `${profile.fullName} — 个人空间`;
document.querySelector('.identity').setAttribute('aria-label', `${profile.fullName} 主页`);
document.querySelector('meta[name="description"]').content = `${profile.fullName} 的个人空间。${profile.headline}`;

for (const role of profile.roles) {
  const label = document.createElement('span');
  label.textContent = role;
  document.querySelector('#roles').append(label);
}

profile.interests.forEach((interest, index) => {
  const label = document.createElement('span');
  label.innerHTML = icon(['code', 'design', 'life'][index % 3]);
  label.append(document.createTextNode(interest));
  document.querySelector('#interests').append(label);
});

const themeButton = document.querySelector('.theme-toggle');
function updateTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const isDark = theme === 'dark';
  themeButton.innerHTML = icon(isDark ? 'sun' : 'moon');
  themeButton.setAttribute('aria-label', `切换至${isDark ? '浅' : '深'}色模式`);
  themeButton.setAttribute('aria-pressed', String(isDark));
  document.querySelector('meta[name="theme-color"]').content = getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim();
}
updateTheme(document.documentElement.dataset.theme || 'light');
themeButton.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  updateTheme(theme);
  try { localStorage.setItem('gavin-theme', theme); } catch {}
});

const clock = document.querySelector('#local-time');
const clockFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
});
function updateClock() {
  const now = new Date();
  clock.textContent = clockFormatter.format(now);
  clock.dateTime = now.toISOString();
}
updateClock();
setInterval(updateClock, 1000);
document.querySelector('#year').textContent = new Date().getFullYear();

const dialog = document.querySelector('#contact-dialog');
const dialogTitle = document.querySelector('#dialog-title');
const dialogDescription = document.querySelector('#dialog-description');
const contactDetail = document.querySelector('.contact-detail');
const contactValue = document.querySelector('#contact-value');
const sendEmail = document.querySelector('.send-email');
const copyButton = document.querySelector('.copy-contact');
const copyStatus = document.querySelector('.copy-status');
const dismissButton = document.querySelector('.dialog-dismiss');
document.querySelector('.close-dialog').innerHTML = icon('close');
copyButton.innerHTML = icon('copy');

function openContact(id = 'email', name = 'Email') {
  const value = id === 'email' ? profile.email : id === 'wechat' ? profile.wechat : '';
  document.querySelector('.dialog-symbol').innerHTML = icon(id);
  copyStatus.textContent = '';
  copyButton.innerHTML = icon('copy');
  contactDetail.hidden = !value;
  sendEmail.hidden = id !== 'email' || !value;
  sendEmail.removeAttribute('href');
  contactValue.textContent = value;
  dismissButton.hidden = Boolean(value);

  if (value) {
    dialogTitle.textContent = id === 'email' ? '让想法，从一封信开始。' : '换个地方，继续聊。';
    dialogDescription.textContent = id === 'email' ? '关于有趣的想法、新的合作，或者只是说声你好。' : '复制下方微信号，在微信中搜索添加。';
    if (id === 'email') sendEmail.href = `mailto:${profile.email}`;
  } else {
    dialogTitle.textContent = '连接，还在路上。';
    dialogDescription.textContent = `${name === 'Email' ? '邮箱' : name}尚未配置，暂时无法联系。真实账号添加后，这个入口就会准备好。`;
  }
  dialog.showModal();
}

document.querySelector('#say-hello').addEventListener('click', () => openContact());
document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
dismissButton.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(contactValue.textContent);
    copyButton.innerHTML = icon('check');
    copyStatus.textContent = '已复制，期待你的消息。';
  } catch {
    copyStatus.textContent = '复制未成功，请选中上方联系方式手动复制。';
  }
});

function socialUrl(social) {
  if (social.id === 'email' && profile.email) return `mailto:${profile.email}`;
  if (!social.url) return '';
  try {
    const url = new URL(social.url);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

for (const [index, social] of profile.socials.entries()) {
  const url = socialUrl(social);
  const isConfigured = Boolean(url || (social.id === 'wechat' && profile.wechat));
  const card = document.createElement(url ? 'a' : 'button');
  card.className = `social-card social-${social.id}`;
  card.innerHTML = `<span class="social-icon">${icon(social.id)}</span><span class="social-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span class="social-copy"><span class="social-name"></span><span class="social-description"></span></span><span class="social-end">${!isConfigured ? '<span class="social-pending">待添加</span>' : ''}${icon('arrow', 'social-arrow')}</span>`;
  card.querySelector('.social-name').textContent = social.name;
  card.querySelector('.social-description').textContent = social.description;
  if (url) {
    card.href = url;
    if (!url.startsWith('mailto:')) {
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.setAttribute('aria-label', `${social.name}，在新标签页打开`);
    }
  } else {
    card.type = 'button';
    card.setAttribute('aria-label', isConfigured ? `查看${social.name}联系方式` : `${social.name}，账号待添加`);
    card.addEventListener('click', () => openContact(social.id, social.name));
  }
  document.querySelector('#social-links').append(card);
}
