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

        searchForNearbyPlaces(lat, lng); 
    });
}(); 

const $map = document.querySelector('.map');
let map;
!async function initMap(markerCoords=[]) {
    // The map location
    const nrbLat = -1.28333;
    const nrbLng = 36.81667;
    const nrbCoords = { lat: nrbLat, lng: nrbLng };

    // Request needed libraries
    const { Map } = await google.maps.importLibrary('maps');

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
                                    maxResultCount=5, 
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

    const fieldMask = 'places.location,places.displayName,places.delivery,places.dineIn,places.takeout,places.websiteUri,places.rating,places.restroom,places.reviews,places.priceRange,places.priceLevel,places.parkingOptions,places.outdoorSeating,places.allowsDogs,places.businessStatus,places.currentOpeningHours';

    const res = await fetch(nearbySearchUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': key,
            'X-Goog-FieldMask': fieldMask,
        },
        body: JSON.stringify(payload),
    });

    const data = res.json();
    console.log(data)
}

function createMarker(title, position) {
    const marker = new google.maps.Marker({
        map,
        // icon,
        title, 
        position,  
    });

    marker.addListener('click', () => { 
        markerPopup.close();
        markerPopup.setContent(marker.getTitle());
        markerPopup.open(marker.getMap(), marker);
    });

    return marker; 
} 
