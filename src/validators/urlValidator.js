// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0

import { URL_REGEX, EXTRACT_URL_REGEX } from '../regexp/regex.js';

/**
 * Valida se uma URL é válida
 * @param {string} url URL para validar
 * @param {boolean} requireProtocol Se deve exigir protocolo (http/https)
 * @return {boolean} true se a URL é válida
 */
export const isValidUrl = (url, requireProtocol = true) => {
  if (!url) return false;
  
  // Se não requer protocolo, adiciona https:// para validação
  const urlToTest = requireProtocol ? url : (url.startsWith('http') ? url : `https://${url}`);
  
  return URL_REGEX.test(urlToTest);
};

/**
 * Extrai todas as URLs de um texto
 * @param {string} text Texto para extrair URLs
 * @return {Array} Array com todas as URLs válidas encontradas
 */
export const extractUrls = (text = '') => {
  const matches = text.match(EXTRACT_URL_REGEX) || [];
  return matches.filter(url => isValidUrl(url));
}; 