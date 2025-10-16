// src/utils/recipeParser.ts

interface SchemaRecipe {
    '@type': string;
    name?: string;
    description?: string;
    prepTime?: string;
    cookTime?: string;
    totalTime?: string;
    recipeYield?: string | number;
    recipeIngredient?: string[];
    recipeInstructions?: Array<string | { text: string }>;
    image?: string | string[] | { url: string }[];
    url?: string;
    mainEntityOfPage?: string;
    author?: { name: string } | string;
    datePublished?: string;
    dateModified?: string;
    nutrition?: {
      calories?: string;
      proteinContent?: string;
      fatContent?: string;
      carbohydrateContent?: string;
    };
    recipeCategory?: string;
    recipeCuisine?: string;
    keywords?: string;
  }
  
  export async function scrapeRecipeFromURL(url: string): Promise<any> {
    try {
      // Use free CORS proxy
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Parse HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');
      
      // Extract structured data
      const recipeData = extractStructuredRecipe(doc, url);
      
      if (!recipeData) {
        throw new Error('No structured recipe data found on this page');
      }
      
      return recipeData;
      
    } catch (error) {
      console.error('Recipe scraping failed:', error);
      throw error;
    }
  }
  
  function extractStructuredRecipe(doc: Document, sourceUrl: string): any {
    // Look for JSON-LD structured data
    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
    
    for (const script of jsonLdScripts) {
      try {
        const data = JSON.parse(script.textContent);
        
        // Handle arrays of structured data
        const recipes = Array.isArray(data) ? data : [data];
        
        for (const item of recipes) {
          if (item['@type'] === 'Recipe' || 
              (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))) {
            return mapSchemaToRecipe(item, sourceUrl);
          }
        }
      } catch (e) {
        console.warn('Failed to parse JSON-LD:', e);
        continue;
      }
    }
    
    // Fallback: Look for microdata
    const microdataRecipe = extractMicrodataRecipe(doc, sourceUrl);
    if (microdataRecipe) {
      return microdataRecipe;
    }
    
    return null;
  }
  
  function mapSchemaToRecipe(schemaData: SchemaRecipe, sourceUrl: string): any {
    return {
      dishName: schemaData.name || '',
      description: schemaData.description || '',
      chef: extractAuthorName(schemaData.author),
      cuisine: schemaData.recipeCuisine || schemaData.recipeCategory || '',
      prepTime: extractTimeInMinutes(schemaData.prepTime),
      cookTime: extractTimeInMinutes(schemaData.cookTime),
      totalTime: extractTimeInMinutes(schemaData.totalTime),
      servings: extractServings(schemaData.recipeYield),
      ingredients: schemaData.recipeIngredient || [],
      instructions: extractInstructions(schemaData.recipeInstructions),
      imageURL: extractImageUrl(schemaData.image),
      source: schemaData.url || schemaData.mainEntityOfPage || sourceUrl,
      notes: schemaData.keywords || '',
      // Set default dietary restrictions (can be enhanced later)
      dietaryRestrictions: {
        vegetarian: false,
        vegan: false,
        dairyFree: false,
        containsNuts: false,
        glutenFree: false,
        kosher: false,
        halal: false,
      }
    };
  }
  
  function extractAuthorName(author: any): string {
    if (!author) return '';
    if (typeof author === 'string') return author;
    if (author.name) return author.name;
    return '';
  }
  
  function extractTimeInMinutes(timeString: string | undefined): number {
    if (!timeString) return 0;
    
    // Handle ISO 8601 duration format (PT15M, PT1H30M, etc.)
    const match = timeString.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (match) {
      const hours = parseInt(match[1] || '0');
      const minutes = parseInt(match[2] || '0');
      return hours * 60 + minutes;
    }
    
    // Handle simple number format
    const numberMatch = timeString.match(/(\d+)/);
    if (numberMatch) {
      return parseInt(numberMatch[1]);
    }
    
    return 0;
  }
  
  function extractServings(recipeYield: string | number | undefined): number {
    if (!recipeYield) return 1;
    if (typeof recipeYield === 'number') return recipeYield;
    
    const match = recipeYield.toString().match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  }
  
  function extractInstructions(instructions: any): string[] {
    if (!instructions) return [];
    
    return instructions.map((instruction: any) => {
      if (typeof instruction === 'string') {
        return instruction;
      }
      if (instruction.text) {
        return instruction.text;
      }
      if (instruction.name) {
        return instruction.name;
      }
      return String(instruction);
    });
  }
  
  function extractImageUrl(image: any): string {
    if (!image) return '';
    
    if (typeof image === 'string') {
      return image;
    }
    
    if (Array.isArray(image)) {
      const firstImage = image[0];
      if (typeof firstImage === 'string') {
        return firstImage;
      }
      if (firstImage?.url) {
        return firstImage.url;
      }
    }
    
    if (image.url) {
      return image.url;
    }
    
    return '';
  }
  
  // Fallback: Extract from microdata
  function extractMicrodataRecipe(doc: Document, sourceUrl: string): any {
    const recipeElement = doc.querySelector('[itemtype*="Recipe"]');
    if (!recipeElement) return null;
    
    return {
      dishName: getMicrodataProperty(recipeElement, 'name') || '',
      description: getMicrodataProperty(recipeElement, 'description') || '',
      chef: getMicrodataProperty(recipeElement, 'author') || '',
      cuisine: getMicrodataProperty(recipeElement, 'recipeCuisine') || '',
      prepTime: extractTimeInMinutes(getMicrodataProperty(recipeElement, 'prepTime') ?? undefined),
      cookTime: extractTimeInMinutes(getMicrodataProperty(recipeElement, 'cookTime') ?? undefined),
      totalTime: extractTimeInMinutes(getMicrodataProperty(recipeElement, 'totalTime') ?? undefined),
      servings: extractServings(getMicrodataProperty(recipeElement, 'recipeYield') ?? undefined),
      ingredients: Array.from(recipeElement.querySelectorAll('[itemprop="recipeIngredient"]'))
        .map(el => el.textContent?.trim() || ''),
      instructions: Array.from(recipeElement.querySelectorAll('[itemprop="recipeInstructions"]'))
        .map(el => el.textContent?.trim() || ''),
      imageURL: getMicrodataProperty(recipeElement, 'image') || '',
      source: sourceUrl,
      notes: '',
      dietaryRestrictions: {
        vegetarian: false,
        vegan: false,
        dairyFree: false,
        containsNuts: false,
        glutenFree: false,
        kosher: false,
        halal: false,
      }
    };
  }
  
  function getMicrodataProperty(element: Element, property: string): string | null {
    const propElement = element.querySelector(`[itemprop="${property}"]`);
    return propElement?.textContent?.trim() || null;
  }