// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0

import { HASHTAG_REGEX, EXTRACT_HASHTAG_REGEX } from '../regexp/regex.js';

/**
 * Valida se uma hashtag é válida
 * @param {string} hashtag Hashtag para validar
 * @return {boolean} true se a hashtag é válida
 */
export const isValidHashtag = (hashtag) => {
  if (!hashtag) return false;
  if(!hashtag.startsWith('#')) return false;
  // Remove # se existir
  const tag = hashtag.slice(1);
  return HASHTAG_REGEX.test(tag);
};

/**
 * Extrai todas as hashtags de um texto
 * @param {string} text Texto para extrair hashtags
 * @return {Array} Array com todas as hashtags válidas encontradas
 */
export const extractHashtags = (text = '') => {
  const matches = text.match(EXTRACT_HASHTAG_REGEX) || [];
  return matches.filter(tag => isValidHashtag(tag));
}; 