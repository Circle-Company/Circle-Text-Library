// Copyright 2025 Circle Company, Inc.
// Licensed under the Circle License, Version 1.0

import { USERNAME_REGEX, EXTRACT_MENTION_REGEX } from '../regexp/regex.js';

/**
 * Valida se um nome de usuário é válido
 * @param {string} username Nome de usuário para validar
 * @return {boolean} true se o username é válido
 */
export const isValidUsername = (username) => {
  if (!username) return false;
  
  // Remove @ se existir
  const user = username.startsWith('@') ? username.slice(1) : username;
  return USERNAME_REGEX.test(user);
};

/**
 * Extrai todas as menções de um texto
 * @param {string} text Texto para extrair menções
 * @return {Array} Array com todas as menções válidas encontradas
 */
export const extractMentions = (text = '') => {
  const matches = text.match(EXTRACT_MENTION_REGEX) || [];
  return matches.filter(mention => isValidUsername(mention));
}; 