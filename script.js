function initMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 34.15334, lng: -118.761676},
    zoom: 12
  });

  fetchedLocations = fetchLocations();
  fetchedLocations.then(function(locationData) {
    setMarkers(locationData, map);
  });
}

function fetchLocations() {
   return fetch('https://api.foursquare.com/v2/venues/explore?client_id=JEASTQIYAOQHC5EJ45NM4QUSD2AS11EADPF51VDM42O4Q13A&client_secret=GEMFOAQ5IBMRS1ROLEFMRMNEZSV0R3QYPZEMLALQJNUFANCH&v=20180323&limit=15&ll=40.7243,-74.0018&near=Agoura HIlls, CA')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
          let locations = populateLocationsArray(data);
          return locations;
        })
        .catch(function(e) {
            console.log(e);
        });
}

function populateInfoWindow(marker, infowindow, locationData) {
  console.log(locationData);
  if (infowindow.marker != marker) {
    infowindow.setContent('');
    infowindow.marker = marker;
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
    let streetViewService = new google.maps.StreetViewService();
    let radius = 50;
    function getStreetView(data, status) {
      let infowindowContent = `
          <h3 class="markerTitle">${marker.title}</h3>
          <div id="pano"></div>
          <div class="details">
            <div>${locationData.location.formattedAddress[0]}</div>
            <div>${locationData.location.formattedAddress[1]}</div>
          </div>
          `;
      let noStreetViewMessage = '<div class ="details">No street view found.</div>';
      if (status == google.maps.StreetViewStatus.OK) {
        let nearStreetViewLocation = data.location.latLng;
        let heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
        infowindow.setContent(infowindowContent);
        let panoramaOptions = {
          position: nearStreetViewLocation,
          pov: {
            heading: heading,
            pitch: 30
          }
        }
        let panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
      } else {
        infowindow.setContent(noStreetViewMessage + infowindowContent);
      }
    }
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    infowindow.open(map, marker);
  }
}

function populateLocationsArray(locationsData) {
  let responseLength = locationsData.response.groups[0].items.length;
  let locations = [];
  for (let i = 0; i < responseLength; i++) {
    let location = locationsData.response.groups[0].items[i].venue;
    locations.push(location);
  }
  return locations;
}

function setMarkers (locationData, map) {
    console.log(locationData);
    let responseLength = locationData.length;
    let markers = [];
    for (let i = 0; i < responseLength; i++) {
      let lat = locationData[i].location.lat;
      let long = locationData[i].location.lng;
      let position = {lat: lat, lng: long};
      let title = locationData[i].name;
      let marker = new google.maps.Marker({
        map: map,
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        id: i
      });

      markers.push(marker);
      marker.addListener('click', function() {
        populateInfoWindow(this, largeInfoWindow, locationData[i]);
      });
    }
  let largeInfoWindow = new google.maps.InfoWindow();
}

















