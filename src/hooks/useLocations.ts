import { useState, useEffect, useCallback } from 'react';
import { locationsApi } from '../services';
import type { Country } from '../services/locations';

// Global cache
let countriesCache: Country[] | null = null;
let citiesCache: { [key: string]: string[] } = {};

export const useLocations = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [citiesMap, setCitiesMap] = useState<{ [key: string]: string[] }>({});
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCities, setLoadingCities] = useState<{ [key: string]: boolean }>({});

  // Fetch countries once and cache
  useEffect(() => {
    const fetchCountries = async () => {
      if (countriesCache) {
        setCountries(countriesCache);
        setCitiesMap(citiesCache);
        setLoadingCountries(false);
        return;
      }

      try {
        const data = await locationsApi.getCountries();
        countriesCache = data;
        setCountries(data);
        setLoadingCountries(false);

        // Preload cities for first 5 countries
        data.slice(0, 5).forEach(country => {
          fetchCities(country.name);
        });
      } catch (error) {
        console.error('Failed to fetch countries:', error);
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  const fetchCities = useCallback(async (countryName: string) => {
    if (citiesCache[countryName]) {
      setCitiesMap(prev => ({ ...prev, [countryName]: citiesCache[countryName] }));
      return;
    }

    setLoadingCities(prev => ({ ...prev, [countryName]: true }));
    try {
      const cities = await locationsApi.getCities(countryName);
      citiesCache[countryName] = cities;
      setCitiesMap(prev => ({ ...prev, [countryName]: cities }));
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    } finally {
      setLoadingCities(prev => ({ ...prev, [countryName]: false }));
    }
  }, []);

  return {
    countries,
    citiesMap,
    loadingCountries,
    loadingCities,
    fetchCities,
  };
};
