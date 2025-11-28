import {
  Client
} from '@googlemaps/google-maps-services-js';
import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: './.env.local' });

const client = new Client({});

const branchesFilePath = './data/branches.csv';
const results = [];

// Función para introducir una pausa
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function findPlaceId(branch) {
  if (branch.google_place_id) {
    console.log(`✔️ ${branch.name} ya tiene place_id: ${branch.google_place_id}`);
    return null;
  }

  const inputQuery = `${branch.store_name}, ${branch.address}, Montevideo, Uruguay`;

  try {
    const response = await client.findPlaceFromText({
      params: {
        input: inputQuery,
        inputtype: 'textquery',
        fields: ['place_id', 'name'],
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.candidates && response.data.candidates.length > 0) {
      const placeId = response.data.candidates[0].place_id;
      console.log(`🔍 Encontrado: ${branch.name} -> ${placeId}`);
      return {
        ...branch,
        found_place_id: placeId,
        found_name: response.data.candidates[0].name,
      };
    } else {
      console.log(`❌ No se encontró resultado para ${branch.name} (${inputQuery})`);
      return {
        ...branch,
        found_place_id: 'NOT_FOUND',
      };
    }
  } catch (error) {
    console.error(`Error buscando ${branch.name}:`, error.response ? error.response.data : error.message);
    return {
      ...branch,
      found_place_id: 'ERROR',
    };
  }
}

fs.createReadStream(branchesFilePath)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    console.log('Comenzando la búsqueda de Place IDs...');
    const updatedBranches = [];

    for (const branch of results) {
      const result = await findPlaceId(branch);
      if (result) {
        updatedBranches.push(result);
      }
      // Pausa de 100ms entre cada llamada para no exceder los límites de la API
      await delay(100); 
    }

    console.log('\n--- Resultados ---');
    console.log('Copia y pega los IDs encontrados en tu archivo branches.csv');
    updatedBranches.forEach(b => {
        if (b.found_place_id && b.found_place_id !== 'NOT_FOUND' && b.found_place_id !== 'ERROR') {
            console.log(`- ${b.name}: ${b.found_place_id}`);
        }
    });
    console.log('\nProceso completado.');
  });
