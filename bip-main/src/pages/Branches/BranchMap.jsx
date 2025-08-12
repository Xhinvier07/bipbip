import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const BranchMap = ({ branches, selectedBranch, onSelectBranch, apiKey }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [infoWindow, setInfoWindow] = useState(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const defaultMarkerIcon = '/marker_default.png';
  const clickedMarkerIcon = '/marker_clicked.png';
  
  // Default coordinates for FEU Morayta branch (center of initial view)
  const defaultCenter = { lat: 14.6033266, lng: 120.9847206 };
  const defaultZoom = 15.8; // Matching the provided Google Maps link

  // Load Google Maps API
  useEffect(() => {
    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true);
      return;
    }
    
    // Function to initialize Google Maps
    const initGoogleMaps = () => {
      setGoogleMapsLoaded(true);
    };
    
    // If API key is provided, load Google Maps
    if (apiKey) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      // Attach the callback to the window
      window.initGoogleMaps = initGoogleMaps;
      
      document.head.appendChild(script);
      
      return () => {
        // Clean up
        document.head.removeChild(script);
        delete window.initGoogleMaps;
      };
    }
  }, [apiKey]);

  // Initialize map once Google Maps is loaded
  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current) return;
    
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'transit',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'road',
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }]
        }
      ],
      disableDefaultUI: true,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false
    });
    
    // Create an info window to share between markers
    const infoWindowInstance = new window.google.maps.InfoWindow();
    
    setMap(mapInstance);
    setInfoWindow(infoWindowInstance);
    
    // Add zoom controls
    const zoomInBtn = mapRef.current.querySelector('.map-zoom-controls .zoom-in');
    const zoomOutBtn = mapRef.current.querySelector('.map-zoom-controls .zoom-out');
    
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        const currentZoom = mapInstance.getZoom();
        mapInstance.setZoom(currentZoom + 1);
      });
    }
    
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        const currentZoom = mapInstance.getZoom();
        mapInstance.setZoom(currentZoom - 1);
      });
    }
    
  }, [googleMapsLoaded]);
  
  // Update markers when branches or selectedBranch changes
  useEffect(() => {
    if (!map || !window.google || !googleMapsLoaded) return;
    
    // Clear existing markers
    markers.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    
    // Create new markers for each branch
    const newMarkers = branches
      .filter(branch => branch.latitude && branch.longitude)
      .map(branch => {
        const lat = parseFloat(branch.latitude);
        const lng = parseFloat(branch.longitude);
        
        if (isNaN(lat) || isNaN(lng)) return null;
        
        const isSelected = selectedBranch && selectedBranch.branch_name === branch.branch_name;
        
        // Customize marker icon
        const iconUrl = isSelected ? clickedMarkerIcon : defaultMarkerIcon;
        
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: branch.branch_name,
          icon: {
            url: iconUrl,
            scaledSize: new window.google.maps.Size(40, 40), // Resize the marker
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(20, 20)
          },
          animation: isSelected ? window.google.maps.Animation.BOUNCE : null
        });
        
        // Add click event listener
        marker.addListener('click', () => {
          if (infoWindow) {
            infoWindow.close();
          }
          
          // Construct info window content
          const contentString = `
            <div class="map-info-window">
              <h3>${branch.branch_name}</h3>
              <p>${branch.address}</p>
            </div>
          `;
          
          if (infoWindow) {
            infoWindow.setContent(contentString);
            infoWindow.open(map, marker);
          }
          
          // Center the map properly on the selected branch with animation
          centerMapOnBranch(branch);
          
          // Call the onSelectBranch prop to update the selected branch
          onSelectBranch(branch);
        });
        
        return marker;
      })
      .filter(Boolean); // Remove null markers
    
    setMarkers(newMarkers);
    
    // Pan to selected branch if there is one
    if (selectedBranch && selectedBranch.latitude && selectedBranch.longitude) {
      centerMapOnBranch(selectedBranch);
    } else {
      // If no branch is selected, center on default view
      map.setCenter(defaultCenter);
      map.setZoom(defaultZoom);
    }
    
  }, [branches, selectedBranch, map, infoWindow, googleMapsLoaded]);
  
  // Function to center map on a branch with proper positioning
  const centerMapOnBranch = (branch) => {
    if (!map || !branch.latitude || !branch.longitude) return;
    
    const lat = parseFloat(branch.latitude);
    const lng = parseFloat(branch.longitude);
    
    if (isNaN(lat) || isNaN(lng)) return;
    
    // Get the map container dimensions
    const mapContainer = mapRef.current;
    if (!mapContainer) return;
    
    const mapHeight = mapContainer.offsetHeight;
    
    // Position the marker in the upper third of the map view (33% from top)
    const offsetPercent = -0.10;
    const pixelsFromTop = mapHeight * offsetPercent;
    
    // Calculate the pixel coordinates on the screen
    const projection = map.getProjection();
    if (!projection) return;
    
    const latLng = new window.google.maps.LatLng(lat, lng);
    const point = projection.fromLatLngToPoint(latLng);
    
    // Calculate a new point with vertical offset
    const offsetPoint = new window.google.maps.Point(
      point.x,
      point.y - pixelsFromTop / Math.pow(2, map.getZoom())
    );
    
    // Convert back to LatLng
    const offsetLatLng = projection.fromPointToLatLng(offsetPoint);
    
    // Smoothly animate to the new position
    map.panTo(offsetLatLng);
    map.setZoom(17); // Closer zoom when selecting a specific branch
  };
  
  return (
    <motion.div 
      className="branch-map"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Map container */}
      <div className="map" ref={mapRef}></div>
      
      {/* While Google Maps API is loading, show a placeholder */}
      {!googleMapsLoaded && (
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <p>Loading Google Maps...</p>
        </div>
      )}
    </motion.div>
  );
};

export default BranchMap;