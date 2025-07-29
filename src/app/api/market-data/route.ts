import { NextRequest, NextResponse } from 'next/server';
import { realWebScraper } from '@/lib/realWebScraper';

export async function POST(request: NextRequest) {
  try {
    const { address, projectType } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: 'Indirizzo richiesto' },
        { status: 400 }
      );
    }

    // Estrai città dall'indirizzo
    const city = extractCityFromAddress(address);
    
    // Simula dati di mercato basati sulla città
    const marketData = await getMarketDataForCity(city, projectType);
    
    // Ottieni progetti simili tramite web scraping
    const similarProjects = await getSimilarProjects(city, projectType);

    return NextResponse.json({
      location: city,
      averagePrice: marketData.averagePrice,
      priceChange: marketData.priceChange,
      sellingTime: marketData.sellingTime,
      demandLevel: marketData.demandLevel,
      suggestedPricePerSqm: marketData.suggestedPricePerSqm,
      similarProjects: similarProjects
    });

  } catch (error) {
    console.error('Errore API market-data:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

function extractCityFromAddress(address: string): string {
  // Logica semplice per estrarre la città dall'indirizzo
  const parts = address.split(',').map(part => part.trim());
  
  // Cerca la città (solitamente la seconda o terza parte)
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    // Rimuovi numeri e caratteri speciali
    const cleanPart = part.replace(/[0-9]/g, '').trim();
    if (cleanPart.length > 2 && !cleanPart.includes('Via') && !cleanPart.includes('Via')) {
      return cleanPart;
    }
  }
  
  // Fallback: prendi la prima parte dopo la via
  return parts[1] || 'Milano';
}

async function getMarketDataForCity(city: string, projectType: string) {
  // Dati di mercato simulati basati su città reali
  const marketData: { [key: string]: any } = {
    'Milano': {
      averagePrice: 4500,
      priceChange: 3.2,
      sellingTime: 8,
      demandLevel: 'ALTA',
      suggestedPricePerSqm: 4700
    },
    'Roma': {
      averagePrice: 3800,
      priceChange: 2.1,
      sellingTime: 10,
      demandLevel: 'MEDIA',
      suggestedPricePerSqm: 3950
    },
    'Torino': {
      averagePrice: 2200,
      priceChange: 1.8,
      sellingTime: 12,
      demandLevel: 'MEDIA',
      suggestedPricePerSqm: 2300
    },
    'Napoli': {
      averagePrice: 2800,
      priceChange: 1.5,
      sellingTime: 15,
      demandLevel: 'MEDIA',
      suggestedPricePerSqm: 2900
    },
    'Firenze': {
      averagePrice: 3200,
      priceChange: 2.8,
      sellingTime: 9,
      demandLevel: 'ALTA',
      suggestedPricePerSqm: 3350
    },
    'Bologna': {
      averagePrice: 3100,
      priceChange: 3.1,
      sellingTime: 7,
      demandLevel: 'ALTA',
      suggestedPricePerSqm: 3250
    },
    'Genova': {
      averagePrice: 2400,
      priceChange: 1.2,
      sellingTime: 14,
      demandLevel: 'BASSA',
      suggestedPricePerSqm: 2450
    },
    'Palermo': {
      averagePrice: 2100,
      priceChange: 0.8,
      sellingTime: 18,
      demandLevel: 'BASSA',
      suggestedPricePerSqm: 2150
    },
    'Catania': {
      averagePrice: 1900,
      priceChange: 0.5,
      sellingTime: 20,
      demandLevel: 'BASSA',
      suggestedPricePerSqm: 1950
    },
    'Verona': {
      averagePrice: 2600,
      priceChange: 2.3,
      sellingTime: 11,
      demandLevel: 'MEDIA',
      suggestedPricePerSqm: 2700
    }
  };

  // Trova la città più simile se non esiste
  const cityKey = Object.keys(marketData).find(key => 
    city.toLowerCase().includes(key.toLowerCase()) ||
    key.toLowerCase().includes(city.toLowerCase())
  ) || 'Milano';

  return marketData[cityKey];
}

async function getSimilarProjects(city: string, projectType: string) {
  try {
    // Usa il web scraper per ottenere progetti simili
    const searchCriteria = {
      location: city,
      propertyType: projectType === 'RESIDENZIALE' ? 'appartamento' : 'locale commerciale',
      minPrice: 0,
      maxPrice: 1000000,
      minArea: 80,
      maxArea: 200
    };

    const scrapedData = await realWebScraper.scrapeImmobiliare(searchCriteria);
    
    // Filtra e formatta i risultati
    const similarProjects = scrapedData.slice(0, 3).map((property: any) => ({
      title: property.title || `Immobile in ${city}`,
      address: property.location || city,
      pricePerSqm: property.pricePerSqm || 2500,
      area: property.area || 120,
      price: property.price || 300000,
      url: property.url || '#'
    }));

    return similarProjects;

  } catch (error) {
    console.error('Errore web scraping progetti simili:', error);
    
    // Fallback con dati simulati
    return [
      {
        title: `Appartamento in ${city}`,
        address: `${city}, Zona Centro`,
        pricePerSqm: 2800,
        area: 120,
        price: 336000,
        url: '#'
      },
      {
        title: `Residenza ${city}`,
        address: `${city}, Zona Residenziale`,
        pricePerSqm: 3200,
        area: 95,
        price: 304000,
        url: '#'
      },
      {
        title: `Casa indipendente ${city}`,
        address: `${city}, Zona Periferica`,
        pricePerSqm: 2400,
        area: 150,
        price: 360000,
        url: '#'
      }
    ];
  }
}