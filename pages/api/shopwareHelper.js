import axios from 'axios';

export async function fetchShopwareProducts(query, limit = 5) {
  const apiUrl = 'https://stgbackend.altherr.de/api/';
  const apiKey = 'SWSCTW9OBG11BGLXCTFLNWU1VA';

  async function getAdminToken() {
    const auth = await axios(`https://stgbackend.altherr.de/api/oauth/token`, {
      method: 'post',
      data: {
        client_id: 'administration',
        grant_type: 'password',
        scopes: 'write',
        username: 'api_user',
        password:
          '2dWdtqbZL5mwpYv0hTtujQJW6CjLD7s8sMWzAYGD2h7Ps3LdQuaeNbbxPtMgQDfyXiyfZNFDD2C0BFX0snoidR',
      },
    });
    return auth.data.access_token;
  }

  try {
    const token = await getAdminToken();

    const response = await axios.post(
      `https://stgbackend.altherr.de/api/search/product`,
      {
        filter: [
          {
            type: 'multi',
            operator: 'or',
            queries: [
              { field: 'name', type: 'contains', value: "omega" },
              { field: 'description', type: 'contains', value: query },
            ],
          },
        ],
        limit,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('Shopware products:', response.data);

    return response.data.data; // Assuming Shopware returns products in `data.data`
  } catch (error) {
    console.error('Error fetching Shopware products:', error);
    throw new Error('Could not fetch products.');
  }
}
