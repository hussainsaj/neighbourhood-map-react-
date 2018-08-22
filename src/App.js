import React, {Component} from 'react';
import scriptLoader from 'react-async-script-loader';
import escapeRegExp from 'escape-string-regexp';

let showingLocations
let pins = [];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: {},
      query: '',
      requestWasSuccessful: true,
      selectedMarker:'',
      data: [],
      locations: [],
    }
  }

  listItem = (item) => {
    window.google.maps.event.trigger(pins.filter((currentOne)=> currentOne.name === item.title)[0], 'click');
  }

  handleKeyPress(target,item) {
    if(item.charCode===13){
      this.listItem(target)
    }
  }

  componentWillReceiveProps({isScriptLoadSucceed}){
    isScriptLoadSucceed ? (
      this.setState({map:new window.google.maps.Map(document.getElementById('map'))})
    ) : (
      this.setState({requestWasSuccessful: false})
    )
  }

  componentDidMount(){
    fetch('https://api.foursquare.com/v2/venues/explore?near=london&section=trending&limit=100&client_id=ULKR5L1WPN2LNGJD2DXLORLNM0XASVPZN3TGWFKRVHTRNEAA&client_secret=G5GHDVTWM3BVQ1T1GCGI0Y4TK3441RUCJX2XZGQKKWWSFHLQ&v=20180323')
    .then(fetchResponse => {
      fetchResponse.json().then(responseJson => {
        const responseArray = responseJson.response.groups[0].items;
        for (var i=0; i<responseArray.length; i++) {
          this.state.locations.push(
            {title: responseArray[i].venue.name,
            address: responseArray[i].venue.location.address,
            postalCode: responseArray[i].venue.location.postalCode,
            lat: responseArray[i].venue.location.lat,
            lng: responseArray[i].venue.location.lng,
            category: responseArray[i].venue.categories[0].name,
            id: responseArray[i].venue.id}
          )
        }
        this.forceUpdate()
      })
    }).catch (error => {
      console.error(error)
    })
  }

  componentDidUpdate(){
    const {requestWasSuccessful, map, query, locations} = this.state;
    if (!requestWasSuccessful) {
      console.log("error")
    } else {
      showingLocations = locations.filter((locations)=> new RegExp(escapeRegExp(query), 'i').test(locations.title))
      pins = [];
      let infoWindows = [];
      showingLocations.forEach((marker)=> {
        let addInfoWindow= new window.google.maps.InfoWindow({
          content:
            `<div tabIndex="0" class="infoWindow">
            <h4>${marker.title}</h4>
            <p>Category: ${marker.category}</p>
            <p>Address: ${marker.address} ${marker.postalCode}</p>
            <a href=https://www.foursquare.com/v/${marker.id}>View on Foursquare</a>
            </div>`
        });
        let bounds = new window.google.maps.LatLngBounds();
        let addMarker = new window.google.maps.Marker({
          map: map,
          position: marker,
          name : marker.title
        });
        pins.push(addMarker);
        infoWindows.push(addInfoWindow);
        addMarker.addListener('click', function() {
          infoWindows.forEach(info => info.close());
          addInfoWindow.open(map, addMarker);
        })
        pins.forEach((m)=>
          bounds.extend(m.position))
        map.fitBounds(bounds)
      })
    }
  }

 render() {
  const {query, requestWasSuccessful, locations} = this.state;
    showingLocations = locations.filter((locations)=> new RegExp(escapeRegExp(query), 'i').test(locations.title))
    return (
      requestWasSuccessful ? (
        <div>
        <div id="subject" tabIndex='1'>
          <h1>Popular Spots in London</h1>
        </div>
        <div id="container">
          <div id="mapContainer" role="application" tabIndex="-1">
            <div id="map" role="region" aria-label="Popular spots in London"></div>
          </div>
          <div className='panel'>
            <input type='text' placeholder=' Filter Spots' value={query} onChange={(event)=> 
              this.setState({query: event.target.value})} role="search" aria-labelledby="Search for a Places" tabIndex="1"/>
            <div aria-labelledby="list of locations" tabIndex="2">
              {showingLocations.map((selectedLocation, index)=>
                <button type="button" key={index} tabIndex={index+3} area-labelledby={`View details for ${selectedLocation.title}`} onKeyPress={this.handleKeyPress.bind(this,selectedLocation)} onClick={this.listItem.bind(this,selectedLocation)}>
                  {selectedLocation.title}
                </button>
              )}
            </div>
          </div>
        </div>
        <link href="https://fonts.googleapis.com/css?family=Josefin+Sans" rel="stylesheet"></link>
      </div>
      ) : (
      <div>
        <h1>Error: Can't Load Google Map</h1>
      </div>
      )
      )
    }
  }

  export default scriptLoader(
    [`https://maps.googleapis.com/maps/api/js?key=AIzaSyBRNKyK8i9wZmL3sbNDGFP09CH76b8xxUg&v=3.exp`]
    )(App);