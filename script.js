const $bg = document.querySelector('.bg-loader');
const $loader = $bg.querySelector('.bg-load');

!async function setupHotelAutocompleteInp() {
    await google.maps.importLibrary('places');

    // Create the input HTML element, and append it.
    const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: {country: ['ke']},
    });

    // document.body.appendChild(placeAutocomplete); 
    const $hotelWrap = document.querySelector('.autocomplete');
    $hotelWrap.appendChild(placeAutocomplete);

    // Add the gmp-placeselect listener, and display the results.
    placeAutocomplete.addEventListener('gmp-placeselect', async ({ place }) => {
        await place.fetchFields({
            fields: ['displayName', 'formattedAddress', 'location'],
        });

        const res = place.toJSON(); 
        const hotel = res.displayName;
        console.log('Autocomplete Res::', res);
        
        const { location: { lat, lng } } = res; 

        // localStorage['ak-hotel'] = hotel;

        $bg.classList.remove('hide');
        // $loader.classList.add('spinner');
        await searchForNearbyPlaces(lat, lng); 
        $bg.classList.add('hide');
    });
}(); 

const $map = document.querySelector('.map');
let map, infoWindow;
!async function initMap(markerCoords=[]) {
    // The map location
    const nrbLat = -1.28333;
    const nrbLng = 36.81667;
    const nrbCoords = { lat: nrbLat, lng: nrbLng };

    // Request needed libraries
    const { Map, InfoWindow } = await google.maps.importLibrary('maps');
    const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');
    infoWindow = new InfoWindow();

    map = new google.maps.Map($map, {
        zoom: 12,
        center: nrbCoords,
        mapId: 'DEMO_MAP_ID',
        mapTypeControl: false,
    });
}();

async function searchForNearbyPlaces(
                                    latitude, 
                                    longitude, 
                                    radius=500.0, 
                                    maxResultCount=10, 
                                    includedTypes=['restaurant']
                                ) {
    const nearbySearchUrl = 'https://places.googleapis.com/v1/places:searchNearby';
    const key = 'AIzaSyDM7Sbx3ogbiG0l_c-j7PJk4m1ivbddY4I';
    const payload = {
        includedTypes,
        maxResultCount,
        locationRestriction: {
            circle: {
                center: {
                    latitude,
                    longitude,
                },
                radius,
            }
        }           
    };

    const fieldMask = 'places.location,places.displayName'; //,places.delivery,places.dineIn,places.takeout,places.websiteUri,places.rating,places.restroom,places.reviews,places.priceRange,places.priceLevel,places.parkingOptions,places.outdoorSeating,places.allowsDogs,places.businessStatus,places.currentOpeningHours';

    const res = await fetch(nearbySearchUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': key,
            'X-Goog-FieldMask': fieldMask,
        },
        body: JSON.stringify(payload),
    });

    const data = await res.json();
    const { places } = data;

    console.log(places)

    places.forEach(place => {
        const { displayName: { text:title }, location: { latitude:lat, longitude:lng } } = place;
        const position = { lat, lng };
        createMarker(title, position);
        map.setCenter(position);
        map.setZoom(15);
    });
}

function createMarker(title, position) {
    const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position,
        title,
        gmpClickable: true,
    });

    marker.addListener('gmp-click', ({ domEvent, latLng }) => {
        const { target } = domEvent;
        
        infoWindow.close();
        infoWindow.setContent(marker.title);
        infoWindow.open(marker.map, marker);
    });
} 

