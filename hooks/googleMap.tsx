/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/Input";

// Tell TypeScript that google exists on window
declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_MAPS_API_KEY = "AIzaSyC1cj_PC7BXTpOtwpftKi9-DwNczMwjmv8";

interface AddressData {
  display_name?: any;
  address?: any;
  formatted_address?: any;
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  value: string;
  onChange: (value: string | AddressData) => void;
  placeholder?: string;
  className?: string;
}

export default function PlacesAutocompleteInput({
  value,
  onChange,
  placeholder = "Search address...",
  className = "",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google?.maps?.places?.Autocomplete) {
      initializeAutocomplete();
      return;
    }

    if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      const check = () => {
        if (window.google?.maps?.places?.Autocomplete) {
          initializeAutocomplete();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = initializeAutocomplete;
    script.onerror = () => console.error("Failed to load Google Maps API");

    document.head.appendChild(script);

    function initializeAutocomplete() {
      if (!inputRef.current || !window.google?.maps?.places?.Autocomplete)
        return;

      const autocomplete = new (window.google as any).maps.places.Autocomplete(
        inputRef.current,
        {
          fields: ["formatted_address", "name", "geometry"],
          types: ["geocode"],
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (!place.formatted_address || !place.geometry?.location) {
          console.warn("Place missing required data");
          return;
        }

        const fullAddress = place.name
          ? `${place.name}, ${place.formatted_address}`
          : place.formatted_address;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        onChange({
          name: fullAddress,
          lat,
          lng,
        });
      });
    }

    return () => {
      const script = document.querySelector(
        `script[src*="maps.googleapis.com"]`
      );
      if (script) script.remove();
    };
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={handleInputChange}
      className={className}
    />
  );
}
