/**
 * DARBAR FLAVORS SPICES - 10 ROYAL COMPREHENSIVE THEME & STYLE SWITCHER
 * Dynamic real-time preview of 10 luxury royal environments across the ENTIRE website.
 */

(function () {
  'use strict';

  const THEME_PRESETS = [
    {
      id: 1,
      nameUrdu: "شاہی شاہانہ گولڈ (Imperial Gold)",
      nameEn: "Option 1: Royal Imperial Gold & Obsidian",
      tagline: "کلاسک 24K مغل شاہی گولڈ، اونکس بلیک اور امبر لائٹ کا مسحور کن روایتی دربار اسٹائل",
      gradientPreview: "linear-gradient(135deg, #FFE8A3 0%, #D4AF37 50%, #9E7D3B 100%)",
      vars: {
        '--gold-primary': '#C5A059',
        '--gold-light': '#F7E7B4',
        '--gold-dark': '#9E7D3B',
        '--gold-metallic': 'linear-gradient(135deg, #FFE8A3 0%, #D4AF37 35%, #9E7D3B 75%, #F7E7B4 100%)',
        '--border-gold-subtle': 'rgba(197, 160, 89, 0.4)',
        '--gold-glow': '0 4px 24px rgba(197, 160, 89, 0.45)',
        '--spice-red': '#B22222',
        '--spice-red-dark': '#8B0000'
      }
    },
    {
      id: 2,
      nameUrdu: "دیگی روبی لال (Degi Ruby Red)",
      nameEn: "Option 2: Degi Ruby Red & Crimson",
      tagline: "اصلی کشمیری دیگی لال مرچ، یاقوتی روبی ریڈ اور گرم مسالہ جات کا پرکشش شاہانہ انداز",
      gradientPreview: "linear-gradient(135deg, #FF6B6B 0%, #C0392B 50%, #78281F 100%)",
      vars: {
        '--gold-primary': '#E74C3C',
        '--gold-light': '#FFD5D5',
        '--gold-dark': '#962D22',
        '--gold-metallic': 'linear-gradient(135deg, #FFA07A 0%, #E74C3C 35%, #962D22 75%, #FFD5D5 100%)',
        '--border-gold-subtle': 'rgba(231, 76, 60, 0.45)',
        '--gold-glow': '0 4px 24px rgba(231, 76, 60, 0.5)',
        '--spice-red': '#C0392B',
        '--spice-red-dark': '#78281F'
      }
    },
    {
      id: 3,
      nameUrdu: "شاہی مغل زمردی سبز (Emerald Green)",
      nameEn: "Option 3: Emerald Mughal Palace Green",
      tagline: "خوشبودار سبز الائچی، شالیمار باغات اور شاہی زمرد و جیڈ گرین کا مسحور کن قدرتی ماحول",
      gradientPreview: "linear-gradient(135deg, #2ECC71 0%, #27AE60 50%, #145A32 100%)",
      vars: {
        '--gold-primary': '#27AE60',
        '--gold-light': '#D4EFDF',
        '--gold-dark': '#145A32',
        '--gold-metallic': 'linear-gradient(135deg, #82E0AA 0%, #27AE60 35%, #145A32 75%, #D4EFDF 100%)',
        '--border-gold-subtle': 'rgba(39, 174, 96, 0.45)',
        '--gold-glow': '0 4px 24px rgba(39, 174, 96, 0.5)',
        '--spice-red': '#D35400',
        '--spice-red-dark': '#873600'
      }
    },
    {
      id: 4,
      nameUrdu: "شاہی نیلم بلیو و طلائی (Sapphire Blue)",
      nameEn: "Option 4: Royal Sapphire Blue & Gold",
      tagline: "دربار نیلم پتھر، مڈ نائٹ رائل بلیو اور طلائی بارڈرز کا شاہکار کلاسک انگلش اسٹائل",
      gradientPreview: "linear-gradient(135deg, #5DADE2 0%, #2980B9 50%, #154360 100%)",
      vars: {
        '--gold-primary': '#2980B9',
        '--gold-light': '#D4E6F1',
        '--gold-dark': '#154360',
        '--gold-metallic': 'linear-gradient(135deg, #85C1E9 0%, #2980B9 35%, #154360 75%, #D4E6F1 100%)',
        '--border-gold-subtle': 'rgba(41, 128, 185, 0.45)',
        '--gold-glow': '0 4px 24px rgba(41, 128, 185, 0.5)',
        '--spice-red': '#E74C3C',
        '--spice-red-dark': '#922B21'
      }
    },
    {
      id: 5,
      nameUrdu: "زعفرانی عنبر و دارچینی (Amber Cinnamon)",
      nameEn: "Option 5: Saffron Amber & Warm Cinnamon",
      tagline: "گرم دارچینی، خالص کشمیری کیسر اور شہد مائل امبر سنہری رنگت کا دیسی شاہی ذائقہ",
      gradientPreview: "linear-gradient(135deg, #F5B041 0%, #E67E22 50%, #873600 100%)",
      vars: {
        '--gold-primary': '#E67E22',
        '--gold-light': '#FDEBD0',
        '--gold-dark': '#873600',
        '--gold-metallic': 'linear-gradient(135deg, #F8C471 0%, #E67E22 35%, #873600 75%, #FDEBD0 100%)',
        '--border-gold-subtle': 'rgba(230, 126, 34, 0.45)',
        '--gold-glow': '0 4px 24px rgba(230, 126, 34, 0.5)',
        '--spice-red': '#C0392B',
        '--spice-red-dark': '#78281F'
      }
    },
    {
      id: 6,
      nameUrdu: "شاہی مغل جامنی ویلوٹ (Velvet Purple)",
      nameEn: "Option 6: Majestic Royal Velvet Purple",
      tagline: "مغل دربار کے مخملی جامنی لبادے اور زعفران کے جامنی پھولوں کا امپیریل ویلوٹ لک",
      gradientPreview: "linear-gradient(135deg, #AF7AC5 0%, #8E44AD 50%, #512E5F 100%)",
      vars: {
        '--gold-primary': '#8E44AD',
        '--gold-light': '#EBDEF0',
        '--gold-dark': '#512E5F',
        '--gold-metallic': 'linear-gradient(135deg, #BB8FCE 0%, #8E44AD 35%, #512E5F 75%, #EBDEF0 100%)',
        '--border-gold-subtle': 'rgba(142, 68, 173, 0.45)',
        '--gold-glow': '0 4px 24px rgba(142, 68, 173, 0.5)',
        '--spice-red': '#C0392B',
        '--spice-red-dark': '#78281F'
      }
    },
    {
      id: 7,
      nameUrdu: "گلاب سنہری و شیمپین موتی (Rose Gold)",
      nameEn: "Option 7: Rose Gold & Champagne Pearl",
      tagline: "خالص عرق گلاب، ہمالیائی پنک سالٹ اور پرتعیش شیمپین روز گولڈ کی شائستہ و نفیس نزاکت",
      gradientPreview: "linear-gradient(135deg, #F5B7B1 0%, #D98880 50%, #78281F 100%)",
      vars: {
        '--gold-primary': '#D98880',
        '--gold-light': '#FDEDEC',
        '--gold-dark': '#78281F',
        '--gold-metallic': 'linear-gradient(135deg, #FADBD8 0%, #D98880 35%, #78281F 75%, #FDEDEC 100%)',
        '--border-gold-subtle': 'rgba(217, 136, 128, 0.45)',
        '--gold-glow': '0 4px 24px rgba(217, 136, 128, 0.5)',
        '--spice-red': '#A93226',
        '--spice-red-dark': '#78281F'
      }
    },
    {
      id: 8,
      nameUrdu: "بلیک ڈائمنڈ و الٹرا 24K گولڈ (Dark Mode)",
      nameEn: "Option 8: 24K Gold & Obsidian Dark Mode",
      tagline: "فل ڈارک موڈ لگژری، شیشے جیسا سیاہ کینوس اور چمکتے ہوئے 24 قیراط خالص سنہری بارڈرز",
      gradientPreview: "linear-gradient(135deg, #FFF5A5 0%, #FFD700 50%, #B8860B 100%)",
      vars: {
        '--gold-primary': '#FFD700',
        '--gold-light': '#FFFDE7',
        '--gold-dark': '#B8860B',
        '--gold-metallic': 'linear-gradient(135deg, #FFF9C4 0%, #FFD700 35%, #B8860B 75%, #FFF 100%)',
        '--border-gold-subtle': 'rgba(255, 215, 0, 0.5)',
        '--gold-glow': '0 4px 28px rgba(255, 215, 0, 0.6)',
        '--spice-red': '#E53935',
        '--spice-red-dark': '#B71C1C'
      }
    },
    {
      id: 9,
      nameUrdu: "قدیم تانبا برونز و پیپریکا (Copper Bronze)",
      nameEn: "Option 9: Antique Copper Bronze & Paprika",
      tagline: "روایتی ہاتھ سے کوٹی گئی تانبے کی دیگ، برونز کی چمک اور سرخ دیگی پیپریکا کا روایتی روپ",
      gradientPreview: "linear-gradient(135deg, #EDBB99 0%, #DC7633 50%, #6E2C00 100%)",
      vars: {
        '--gold-primary': '#DC7633',
        '--gold-light': '#FBEEE6',
        '--gold-dark': '#6E2C00',
        '--gold-metallic': 'linear-gradient(135deg, #F5CBA7 0%, #DC7633 35%, #6E2C00 75%, #FBEEE6 100%)',
        '--border-gold-subtle': 'rgba(220, 118, 51, 0.45)',
        '--gold-glow': '0 4px 24px rgba(220, 118, 51, 0.5)',
        '--spice-red': '#A93226',
        '--spice-red-dark': '#641E16'
      }
    },
    {
      id: 10,
      nameUrdu: "شاہی ایرانی فیروزی و سنہری (Turquoise & Gold)",
      nameEn: "Option 10: Persian Ferozi Turquoise & Gold",
      tagline: "اصفہانی فیروزی کاشی، سمندری موتی اور ایرانی محلات کے سنہری و فیروزہ پتھروں کا جوڑ",
      gradientPreview: "linear-gradient(135deg, #76D7C4 0%, #16A085 50%, #0E6251 100%)",
      vars: {
        '--gold-primary': '#16A085',
        '--gold-light': '#E8F8F5',
        '--gold-dark': '#0E6251',
        '--gold-metallic': 'linear-gradient(135deg, #A3E4D7 0%, #16A085 35%, #0E6251 75%, #E8F8F5 100%)',
        '--border-gold-subtle': 'rgba(22, 160, 133, 0.45)',
        '--gold-glow': '0 4px 24px rgba(22, 160, 133, 0.5)',
        '--spice-red': '#E74C3C',
        '--spice-red-dark': '#922B21'
      }
    },
    {
      id: 11,
      nameUrdu: "شاہی مہرون، گولڈن اور سفید (Royal Maroon & Gold)",
      nameEn: "Option 11: Royal Maroon, Imperial Gold & Crisp White",
      tagline: "شاہی مہرون، برائٹ گولڈ اور خالص سفید کینوس کا انتہائی پروقار، نفاست بھرا شاہانہ امتزاج",
      gradientPreview: "linear-gradient(135deg, #7A0C16 0%, #D4AF37 55%, #FFFFFF 100%)",
      vars: {
        '--gold-primary': '#D4AF37',
        '--gold-light': '#FFF2C6',
        '--gold-dark': '#9E7D3B',
        '--gold-metallic': 'linear-gradient(135deg, #FFE8A3 0%, #D4AF37 40%, #A67C2E 80%, #FFF2C6 100%)',
        '--border-gold-subtle': 'rgba(212, 175, 55, 0.45)',
        '--gold-glow': '0 4px 25px rgba(212, 175, 55, 0.45)',
        '--spice-red': '#7A0C16',
        '--spice-red-dark': '#52050D'
      }
    }
  ];

  let currentThemeId = 1;

  function applyTheme(id, notify) {
    const preset = THEME_PRESETS.find(p => p.id === Number(id)) || THEME_PRESETS[0];
    currentThemeId = preset.id;

    // 1. Set global data-theme attribute on <html> element for total site transformation
    document.documentElement.setAttribute('data-theme', String(preset.id));

    // 2. Set individual CSS variables as fallback
    const root = document.documentElement;
    for (const [key, val] of Object.entries(preset.vars)) {
      root.style.setProperty(key, val);
    }

    try {
      localStorage.setItem('darbar_selected_theme', String(preset.id));
    } catch (e) {}

    // 3. Update DOM badges & active classes
    const badge = document.getElementById('currentThemeBadge');
    if (badge) badge.textContent = String(preset.id);

    const activeDisplay = document.getElementById('activeThemeNameDisplay');
    if (activeDisplay) {
      activeDisplay.textContent = `آپشن ${preset.id}: ${preset.nameUrdu}`;
    }

    document.querySelectorAll('.theme-option-card').forEach(card => {
      const cardId = Number(card.getAttribute('data-theme-id'));
      if (cardId === preset.id) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    if (notify && typeof DarbarApp !== 'undefined' && DarbarApp.showToast) {
      DarbarApp.showToast(`✨ پوری ویب سائٹ پر آپشن ${preset.id} (${preset.nameUrdu}) لاگو ہو گیا!`);
    }
  }

  function toggleThemeModal() {
    const backdrop = document.getElementById('themeModalBackdrop');
    if (!backdrop) return;
    if (backdrop.classList.contains('active')) {
      closeThemeModal();
    } else {
      backdrop.classList.add('active');
    }
  }

  function closeThemeModal() {
    const backdrop = document.getElementById('themeModalBackdrop');
    if (backdrop) backdrop.classList.remove('active');
  }

  function copySelectedTheme() {
    const preset = THEME_PRESETS.find(p => p.id === currentThemeId) || THEME_PRESETS[0];
    const text = `دربار فلیورز فائنل کلر تھیم: آپشن ${preset.id} (${preset.nameUrdu}) - ${preset.nameEn}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        if (typeof DarbarApp !== 'undefined' && DarbarApp.showToast) {
          DarbarApp.showToast('کاپی ہو گیا: ' + text);
        } else {
          alert('کاپی ہو گیا: ' + text);
        }
      });
    } else {
      alert('کاپی ہو گیا: ' + text);
    }
  }

  function renderThemeSwitcherUI() {
    if (document.getElementById('themeSwitcherToggle')) return;

    // 1. Floating Pill Button on Left Side
    const pill = document.createElement('div');
    pill.id = 'themeSwitcherToggle';
    pill.className = 'theme-switcher-pill';
    pill.title = 'کلک کر کے پوری ویب سائٹ کا کلر تھیم و اسٹائل تبدیل کریں (1 تا 10)';
    pill.onclick = toggleThemeModal;
    pill.innerHTML = `
      <span class="theme-pill-icon"><i class="fa-solid fa-palette"></i></span>
      <span class="theme-pill-text font-urdu">تھیم و اسٹائل (1 - 10)</span>
      <span class="theme-pill-badge" id="currentThemeBadge">${currentThemeId}</span>
    `;
    document.body.appendChild(pill);

    // 2. Comprehensive 10-Option Modal
    const modal = document.createElement('div');
    modal.id = 'themeModalBackdrop';
    modal.className = 'theme-modal-backdrop';
    modal.onclick = closeThemeModal;

    let optionsHtml = '';
    THEME_PRESETS.forEach(preset => {
      const isActive = preset.id === currentThemeId ? ' active' : '';
      optionsHtml += `
        <div class="theme-option-card${isActive}" data-theme-id="${preset.id}" onclick="DarbarThemeSwitcher.selectTheme(${preset.id})">
          <div class="theme-number-badge">${preset.id}</div>
          <div class="theme-details-wrap">
            <div class="theme-swatch-bar" style="background: ${preset.gradientPreview};"></div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <span class="theme-name-ur font-urdu">${preset.nameUrdu}</span>
              <span class="theme-badge-click font-urdu">کلک کریں</span>
            </div>
            <span class="theme-name-en">${preset.nameEn}</span>
            <p class="theme-tagline-desc font-urdu">${preset.tagline}</p>
          </div>
          <i class="fa-solid fa-circle-check theme-check-icon"></i>
        </div>
      `;
    });

    const activePreset = THEME_PRESETS.find(p => p.id === currentThemeId) || THEME_PRESETS[0];

    modal.innerHTML = `
      <div class="theme-modal-card" onclick="event.stopPropagation()">
        <div class="theme-modal-header">
          <div class="theme-modal-title">
            <i class="fa-solid fa-palette" style="color: var(--gold-primary); font-size: 1.4rem;"></i>
            <h3 class="font-urdu">ویب سائٹ کے 10 رائل تھیم و اسٹائل کمبینیشنز</h3>
          </div>
          <button type="button" class="theme-modal-close" onclick="DarbarThemeSwitcher.close()" title="بند کریں">&times;</button>
        </div>
        <p class="theme-modal-subtitle font-urdu">
          کسی بھی آپشن (1 سے 10) پر کلک کریں۔ <strong>شروع سے لے کر آخر تک</strong> ہیڈر، اناؤنسمنٹ بار، ہیرو ویڈیو، بینر، پروڈکٹ کارڈز اور فوٹر کا پورا کلر و اسٹائل لائیو تبدیل ہو جائے گا۔ کسٹمر کو دکھا کر فائنل نمبر منتخب کر لیں۔
        </p>
        <div class="theme-options-grid">
          ${optionsHtml}
        </div>
        <div class="theme-modal-footer">
          <div class="selected-theme-info font-urdu">
            <span>فی الوقت لاگو:</span>
            <strong id="activeThemeNameDisplay">آپشن ${activePreset.id}: ${activePreset.nameUrdu}</strong>
          </div>
          <button type="button" class="btn btn-primary btn-sm" onclick="DarbarThemeSwitcher.copy()">
            <i class="fa-solid fa-copy"></i> منتخب آپشن نمبر کاپی کریں
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Self-execute immediately
  let saved = 1;
  try {
    saved = Number(localStorage.getItem('darbar_selected_theme')) || 1;
  } catch (e) {}

  // Apply data-theme to <html> immediately before DOM completes
  document.documentElement.setAttribute('data-theme', String(saved));

  function init() {
    renderThemeSwitcherUI();
    applyTheme(saved, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose global API
  window.DarbarThemeSwitcher = {
    selectTheme: function (id) {
      applyTheme(id, true);
    },
    toggle: toggleThemeModal,
    close: closeThemeModal,
    copy: copySelectedTheme,
    getPresets: function () {
      return THEME_PRESETS;
    }
  };
})();
