/* eslint-disable*/

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiY2hlYmEiLCJhIjoiY2w0bW13cHp0MGY0ZDNicXVpbm5tbDllaCJ9.Vt8NASgQhXHyeInica3BpA';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/cheba/cl4mnpcu7004214qsqpra4htq', // style URL
    scrollZoom: false,
    focusAfterOpen: false,
    //   center: [-118.114158, 34.119378], // starting position [lng, lat]
    //   zoom: 9, // starting zoom,
    //   interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((loc) => {
    //Create marker
    const el = document.createElement('div');
    el.className = 'marker';
    //Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    //Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 100,
      bottom: 100,
      left: 100,
      right: 100,
    },
  });
};
