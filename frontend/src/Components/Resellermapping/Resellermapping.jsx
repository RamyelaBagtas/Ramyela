import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { useAuth } from '../AuthContext';
import axiosInstance from '../axiosInstance';

const defaultIconURL = 'https://example.com/path/to/default-icon.png';

const Resellermapping = () => {
    const { userId } = useAuth();
    const [allProviders, setAllProviders] = useState([]);
    const [nearbyProviders, setNearbyProviders] = useState([]);
    const [user, setUser] = useState(null);
    const [coordinatesAllowed, setCoordinatesAllowed] = useState(false);
    const mapRef = useRef();
    const [routeControl, setRouteControl] = useState(null);
    const [isDirectionsActive, setIsDirectionsActive] = useState(false);

    useEffect(() => {
        const fetchProviders = async () => {
            if (!userId) return;

            try {
                const response = await axiosInstance.get(`api/nearest/seller/${userId}`, {
                    params: { maxDistance: 10000 }
                });

                const allProvidersData = response.data.providers || [];
                console.log("All providers data:", allProvidersData);
                setAllProviders(allProvidersData);

                const userData = response.data.user;
                setUser(userData);

                // Filter nearby providers based on distance
                const filteredNearbyProviders = allProvidersData.filter(provider => provider.distance <= 10000);
                console.log("Filtered nearby providers:", filteredNearbyProviders);
                setNearbyProviders(filteredNearbyProviders);

                // Adjust map view based on nearby providers
                if (filteredNearbyProviders.length > 0 && userData) {
                    const bounds = filteredNearbyProviders.map(provider => [
                        provider.coordinates[1],
                        provider.coordinates[0]
                    ]);
                    bounds.push([userData.coordinates[1], userData.coordinates[0]]);
                    if (mapRef.current) {
                        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
                    }
                } else if (userData && mapRef.current) {
                    mapRef.current.setView([userData.coordinates[1], userData.coordinates[0]], 13);
                }
            } catch (error) {
                console.error('Error fetching nearby providers:', error);
            }
        };

        const postCoordinatesAndFetchProviders = async () => {
            if (!userId) return;

            try {
                await axiosInstance.post(`api/nearest/seller/${userId}`, {
                    maxDistance: 10000
                });

                setCoordinatesAllowed(true);
                fetchProviders();
            } catch (error) {
                console.error('Error setting coordinates:', error);
            }
        };

        if (userId) {
            postCoordinatesAndFetchProviders();
        }
    }, [userId]);

    const navigateTo = (providerUserId) => {
        window.location.href = `/resellerssellerproduct/${providerUserId}`;
    };

    const createIcon = (url, size, borderColor) => {
        return new L.divIcon({
            className: 'custom-icon',
            html: `<div style="
                background-image: url(${url});
                background-size: cover;
                background-position: center;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                border: 3px solid ${borderColor};
                box-shadow: 0 0 3px rgba(0,0,0,0.5);
            "></div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size],
            popupAnchor: [0, -size]
        });
    };

    const CenterMap = ({ lat, lng }) => {
        const map = useMap();
        useEffect(() => {
            map.setView([lat, lng], 13);
        }, [lat, lng, map]);
        return null;
    };

    const getDirections = (provider, providerPosition) => {
        if (routeControl) {
            mapRef.current.removeControl(routeControl);
        }

        const control = L.Routing.control({
            waypoints: [
                L.latLng(user.coordinates[1], user.coordinates[0]),
                L.latLng(providerPosition[0], providerPosition[1])
            ],
            routeWhileDragging: true,
            createMarker: (i, waypoint) => {
                const iconUrl = i === 0 ? (user.displayPictureURL || defaultIconURL) : (provider.displayPictureURL || defaultIconURL);
                return L.marker(waypoint.latLng, {
                    icon: createIcon(iconUrl, i === 0 ? 50 : 32, i === 0 ? 'blue' : 'green')
                });
            }
        }).addTo(mapRef.current);

        setRouteControl(control);
        setIsDirectionsActive(true);
    };

    const exitDirections = () => {
        if (routeControl) {
            mapRef.current.removeControl(routeControl);
            setRouteControl(null);
            setIsDirectionsActive(false);
        }
    };

    return (
        <div>
        <div style={{ padding: '20px' }}>
            <h1>See Nearby Providers</h1>
            {!coordinatesAllowed && (
                <button onClick={() => setCoordinatesAllowed(true)} style={{ marginBottom: '10px' }}>
                    Allow Access
                </button>
            )}
            <div style={{ position: 'relative', height: '700px', width: '100%' }}>
                <MapContainer
                    ref={mapRef}
                    style={{ height: '100%', width: '100%' }}
                    zoom={13}
                    center={[0, 0]} 
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {user && (
                        <>
                            <CenterMap lat={user.coordinates[1]} lng={user.coordinates[0]} />
                            <Marker
                                position={[user.coordinates[1], user.coordinates[0]]}
                                icon={createIcon(user.displayPictureURL || defaultIconURL, 50, 'blue')}
                            >
                                <Popup>
                                    <strong>{user.fullName}</strong><br />
                                    {user.country}, {user.region}, {user.province}, {user.city}, {user.barangay}<br />
                                </Popup>
                            </Marker>
                        </>
                    )}
                    {nearbyProviders.length === 0 && coordinatesAllowed && (
                        <p>No nearby suppliers found within the specified range.</p>
                    )}
                    {nearbyProviders.map((provider) => {
                        const providerPosition = [provider.coordinates[1], provider.coordinates[0]];

                        return (
                            <Marker
                                position={providerPosition}
                                key={provider._id}
                                icon={createIcon(provider.displayPictureURL || defaultIconURL, 32, 'green')}
                            >
                                <Popup>
                                    <div>
                                        <strong>{provider.firstName} {provider.lastName}</strong><br />
                                        User Type: {provider.userType}<br />
                                        {provider.country}, {provider.region}, {provider.province}, {provider.city}, {provider.barangay}<br />
                                        Distance: {(provider.distance / 1000).toFixed(1)} km
                                    </div>
                                    <div style={{ marginTop: '10px' }}>
                                        <button 
                                            onClick={() => navigateTo(provider.userId)}
                                            style={{ padding: '5px 10px', cursor: 'pointer' }}
                                        >
                                            See Products
                                        </button>
                                        <button onClick={() => getDirections(provider, providerPosition)} style={{ padding: '5px 10px', cursor: 'pointer', marginLeft: '5px', background: '#89CFF0' }}>Get Directions</button>
                                        {isDirectionsActive && <button onClick={exitDirections} style={{ marginTop: '20px', padding: '5px 10px', background: '#F88379' }}>Exit Directions</button>}
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>

            <h1>Providers</h1>
            <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {allProviders.map(provider => {
                    if (provider.userType === 'seller') {
                        return (
                            <div key={provider._id} style={{
                                border: '1px solid #ccc',
                                borderRadius: '8px',
                                width: '150px',
                                padding: '10px',
                                textAlign: 'center',
                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                            }}>
                                <img
                                    src={provider.displayPictureURL || defaultIconURL}
                                    alt={`${provider.firstName} ${provider.lastName}`}
                                    style={{ width: '100%', height: '100px', borderRadius: '8px' }}
                                />
                        <h3 style={{ fontSize: '1rem', margin: '5px 0' }}>{provider.firstName} {provider.lastName}</h3>
                        <p style={{ fontSize: '0.8rem' }}>Distance: {(provider.distance / 1000).toFixed(1)} km away</p>
                        <p style={{ fontSize: '0.9rem' }}>{provider.userType}</p>
                        <p style={{ fontSize: '0.7rem' }}>{provider.city}, {provider.region}</p>
                                <button
                                    onClick={() => navigateTo(provider.userId)}
                                    style={{
                                        padding: '5px 10px',
                                        background: '#5A9EFC',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    View Products
                                </button>
                            </div>
                        );
                    }
                })}
            </div>
        </div>
        </div>
    );
};

export default Resellermapping;