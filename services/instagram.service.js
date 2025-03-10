require('dotenv').config();
const fetch = require('node-fetch');

const INSTAGRAM_API_URL = 'https://graph.instagram.com/';
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

class InstagramService {
  /**
   * Récupère les dernières images du compte Instagram via l'API officielle
   * @param {string} userId L'ID du compte Instagram (à récupérer via l'API Graph)
   * @param {number} count Nombre d'images à récupérer (par défaut 3)
   * @returns {Promise<string[]>} Liste des URLs des images
   */
  async getLatestInstagramPosts(userId, count = 3) {
    try {
      const response = await fetch(
        `${INSTAGRAM_API_URL}${userId}/media?fields=id,media_type,media_url,permalink&access_token=${ACCESS_TOKEN}`
      );

      if (!response.ok) {
        throw new Error(`Erreur API Instagram: ${response.statusText}`);
      }

      const data = await response.json();

      // Filtrer uniquement les images
      const images = data.data
        .filter(post => post.media_type === 'IMAGE')
        .slice(0, count)
        .map(post => post.media_url);

      return images;
    } catch (error) {
      console.error('Erreur lors de la récupération des images Instagram:', error);
      return [];
    }
  }
}

const instagramService = new InstagramService();
module.exports = instagramService;
