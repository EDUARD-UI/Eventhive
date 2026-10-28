import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import esData from '../i18n/es.json';
import enData from '../i18n/en.json';

const LanguageContext = createContext(null);

const DICTIONARIES = {
  es: esData,
  en: enData,
};

// Construir mapa normalizado de frases Español -> Inglés desde es.json
const PHRASE_MAP = esData.phrases || {};
const NORMALIZED_PHRASE_MAP = new Map();

Object.entries(PHRASE_MAP).forEach(([esText, enText]) => {
  if (esText && enText) {
    NORMALIZED_PHRASE_MAP.set(esText.trim(), enText);
    NORMALIZED_PHRASE_MAP.set(esText.trim().toLowerCase(), enText);
  }
});

// Patrones dinámicos frecuentes (contadores, fechas, saludos, paginación)
const DYNAMIC_PATTERNS_ES_TO_EN = [
  {
    regex: /^(\d+)\s+evento$/i,
    replace: (_, count) => `${count} event`,
  },
  {
    regex: /^(\d+)\s+eventos$/i,
    replace: (_, count) => `${count} events`,
  },
  {
    regex: /^(\d+)\s+tipo$/i,
    replace: (_, count) => `${count} type`,
  },
  {
    regex: /^(\d+)\s+tipos$/i,
    replace: (_, count) => `${count} types`,
  },
  {
    regex: /^(\d+)\s+nuevas?$/i,
    replace: (_, count) => `${count} new`,
  },
  {
    regex: /^Todos\s*\((\d+)\)$/i,
    replace: (_, count) => `All (${count})`,
  },
  {
    regex: /^Activos\s*\((\d+)\)$/i,
    replace: (_, count) => `Active (${count})`,
  },
  {
    regex: /^Finalizados\s*\((\d+)\)$/i,
    replace: (_, count) => `Finished (${count})`,
  },
  {
    regex: /^Buscando en radio de\s+(.+)\s*km$/i,
    replace: (_, dist) => `Searching within ${dist} km`,
  },
  {
    regex: /^Experiencias de\s+(.+)$/i,
    replace: (_, org) => `Experiences by ${org}`,
  },
  {
    regex: /^Eventos para\s+(.+)$/i,
    replace: (_, date) => `Events for ${date}`,
  },
  {
    regex: /^¡Hola,\s*(.+)!$/i,
    replace: (_, name) => `Hello, ${name}!`,
  },
  {
    regex: /^(.+)\s*·\s*Impuestos incluidos$/i,
    replace: (_, tier) => `${tier === 'Entrada General' ? 'General Admission' : tier} · Taxes included`,
  },
  {
    regex: /^(.+)\s*·\s*Entrada$/i,
    replace: (_, tier) => `${tier === 'General' ? 'General' : tier} · Ticket`,
  },
  {
    regex: /^Precio base\s*\((\d+)\s*boletas?\)$/i,
    replace: (_, qty) => `Base price (${qty} ${Number(qty) === 1 ? 'ticket' : 'tickets'})`,
  },
  {
    regex: /^No hay coincidencias para el término\s+[“"](.+)[”"]\.?$/i,
    replace: (_, term) => `No matches found for “${term}”.`,
  },
];

function translateRawStringToEn(rawStr) {
  if (!rawStr || typeof rawStr !== 'string') return null;
  const trimmed = rawStr.trim();
  if (!trimmed) return null;

  // 1. Coincidencia exacta
  if (NORMALIZED_PHRASE_MAP.has(trimmed)) {
    const translated = NORMALIZED_PHRASE_MAP.get(trimmed);
    return rawStr.replace(trimmed, translated);
  }

  // 2. Coincidencia insensible a mayúsculas
  const lower = trimmed.toLowerCase();
  if (NORMALIZED_PHRASE_MAP.has(lower)) {
    const translated = NORMALIZED_PHRASE_MAP.get(lower);
    const isAllUpper = trimmed === trimmed.toUpperCase() && trimmed !== trimmed.toLowerCase();
    const finalTrans = isAllUpper ? translated.toUpperCase() : translated;
    return rawStr.replace(trimmed, finalTrans);
  }

  // 3. Patrones dinámicos
  for (const pattern of DYNAMIC_PATTERNS_ES_TO_EN) {
    const match = trimmed.match(pattern.regex);
    if (match) {
      const translated = pattern.replace(...match);
      return rawStr.replace(trimmed, translated);
    }
  }

  return null;
}

function resolveKeyPath(obj, path) {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

function humanizeKeyFallback(key) {
  if (!key || typeof key !== 'string') return '';
  // Si parece una clave con punto (ej. "home.upcomingEvents") sin espacios, convertir la última parte en texto legible
  if (/^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)+$/.test(key.trim())) {
    const lastSegment = key.trim().split('.').pop() || key;
    const spaced = lastSegment
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  }
  return key;
}

const IGNORED_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'NOSCRIPT', 'SVG', 'PATH']);
const TRANSLATABLE_ATTRS = ['placeholder', 'title', 'aria-label'];

function syncDomTreeLanguage(rootNode, lang) {
  if (!rootNode || typeof document === 'undefined') return;

  const walker = document.createTreeWalker(
    rootNode,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (IGNORED_TAGS.has(node.tagName)) return NodeFilter.FILTER_REJECT;
          if (node.getAttribute && node.getAttribute('data-no-translate') === 'true') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
        if (node.nodeType === Node.TEXT_NODE) {
          const parent = node.parentElement;
          if (!parent || IGNORED_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
          if (parent.closest && parent.closest('[data-no-translate="true"]')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
      },
    }
  );

  let current = walker.currentNode;
  while (current) {
    if (current.nodeType === Node.TEXT_NODE) {
      const currentVal = current.nodeValue;
      if (lang === 'en') {
        // Si React actualizó el nodo directamente (por ejemplo vía t()), limpiar caché previa
        if (current.__ehTranslated !== undefined && currentVal !== current.__ehTranslated) {
          delete current.__ehOrigText;
          delete current.__ehTranslated;
        }
        const sourceText = current.__ehOrigText ?? currentVal;
        const translated = translateRawStringToEn(sourceText);
        if (translated && translated !== currentVal) {
          current.__ehOrigText = sourceText;
          current.__ehTranslated = translated;
          current.nodeValue = translated;
        }
      } else if (lang === 'es') {
        if (current.__ehOrigText !== undefined) {
          if (currentVal === current.__ehTranslated) {
            current.nodeValue = current.__ehOrigText;
          }
          delete current.__ehOrigText;
          delete current.__ehTranslated;
        }
      }
    } else if (current.nodeType === Node.ELEMENT_NODE) {
      TRANSLATABLE_ATTRS.forEach((attr) => {
        const val = current.getAttribute(attr);
        if (!val) return;
        if (!current.__ehOrigAttrs) current.__ehOrigAttrs = {};
        if (!current.__ehTransAttrs) current.__ehTransAttrs = {};

        if (lang === 'en') {
          if (current.__ehTransAttrs[attr] !== undefined && val !== current.__ehTransAttrs[attr]) {
            delete current.__ehOrigAttrs[attr];
            delete current.__ehTransAttrs[attr];
          }
          const sourceAttr = current.__ehOrigAttrs[attr] ?? val;
          const translated = translateRawStringToEn(sourceAttr);
          if (translated && translated !== val) {
            current.__ehOrigAttrs[attr] = sourceAttr;
            current.__ehTransAttrs[attr] = translated;
            current.setAttribute(attr, translated);
          }
        } else if (lang === 'es') {
          if (current.__ehOrigAttrs[attr] !== undefined) {
            if (val === current.__ehTransAttrs[attr]) {
              current.setAttribute(attr, current.__ehOrigAttrs[attr]);
            }
            delete current.__ehOrigAttrs[attr];
            delete current.__ehTransAttrs[attr];
          }
        }
      });
    }
    current = walker.nextNode();
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('eventhive_lang');
      if (saved === 'es' || saved === 'en') {
        return saved;
      }
    } catch {
      // Fallback seguro si localStorage está restringido
    }
    return 'es';
  });

  const setLanguage = useCallback((nextLang) => {
    const normalized = nextLang === 'en' ? 'en' : 'es';
    setLanguageState(normalized);
    try {
      localStorage.setItem('eventhive_lang', normalized);
    } catch {
      // Ignorar errores de almacenamiento
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === 'es' ? 'en' : 'es';
      try {
        localStorage.setItem('eventhive_lang', next);
      } catch {
        // Ignorar errores de almacenamiento
      }
      return next;
    });
  }, []);

  const t = useCallback(
    (key, fallbackOrParams, maybeParams) => {
      if (!key) return '';
      const fallback = typeof fallbackOrParams === 'string' ? fallbackOrParams : undefined;
      const params =
        typeof fallbackOrParams === 'object' && fallbackOrParams !== null
          ? fallbackOrParams
          : typeof maybeParams === 'object' && maybeParams !== null
          ? maybeParams
          : {};

      const activeDict = DICTIONARIES[language] || esData;
      let result = resolveKeyPath(activeDict, key);

      if (result === undefined) {
        result = resolveKeyPath(esData, key);
      }

      if (result === undefined) {
        if (fallback !== undefined) {
          result = fallback;
        } else if (language === 'en') {
          result = translateRawStringToEn(key) || humanizeKeyFallback(key);
        } else {
          result = humanizeKeyFallback(key);
        }
      }

      if (typeof result === 'string' && Object.keys(params).length > 0) {
        return Object.entries(params).reduce(
          (str, [paramKey, paramVal]) =>
            str.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), String(paramVal ?? '')),
          result
        );
      }

      return result;
    },
    [language]
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = language;

    let rafId = null;
    let isSyncing = false;

    const runSync = () => {
      if (isSyncing) return;
      isSyncing = true;
      try {
        syncDomTreeLanguage(document.body, language);
      } finally {
        isSyncing = false;
      }
    };

    runSync();

    const observer = new MutationObserver(() => {
      if (isSyncing) return;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(runSync);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      isEnglish: language === 'en',
      t,
    }),
    [language, setLanguage, toggleLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'es',
      setLanguage: () => {},
      toggleLanguage: () => {},
      isEnglish: false,
      t: (key) => resolveKeyPath(esData, key) ?? key,
    };
  }
  return context;
}

export default LanguageContext;

