import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import m2hLogo from '../assets/m2h-logo.svg';
import './RoomsOccupants.css';

function RoomsOccupants() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('rooms');
    const [rooms, setRooms] = useState([]);
    const [occupants, setOccupants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    // no Add Room UI here - rooms are provided by the system
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [movingOccupant, setMovingOccupant] = useState(null);
    const [moveTargetRoomId, setMoveTargetRoomId] = useState(null);
    const [movingFromRoomId, setMovingFromRoomId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error || !data.user) {
                navigate("/");
            } else {
                setUser(data.user);
            }
        };
        checkUser();
        fetchRooms();
        fetchOccupants();
    }, [navigate]);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('rooms')
                .select(`
                    *,
                    occupant:occupant_id (
                        id,
                        first_name,
                        last_name,
                        email
                    )
                `)
                .order('room_number');

            if (error) throw error;
            setRooms(data || []);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOccupants = async () => {
        try {
            const { data, error } = await supabase
                .from('occupants')
                .select(`
                    *,
                    room:rooms!occupant_id (
                        room_number,
                        building,
                        monthly_rent
                    )
                `)
                .order('last_name');

            if (error) throw error;
            setOccupants(data || []);
        } catch (error) {
            console.error('Error fetching occupants:', error);
        }
    };

    const handleMoveOccupant = async (occupantId, targetRoomId, fromRoomId) => {
        if (!occupantId || !targetRoomId) return;
        setLoading(true);
        try {
            // If target room currently has an occupant, this will overwrite them (they become unassigned)
            const { error: assignError } = await supabase
                .from('rooms')
                .update({ occupant_id: occupantId, status: 'occupied' })
                .eq('id', targetRoomId);

            if (assignError) throw assignError;

            // Clear the previous room's occupant_id if provided
            if (fromRoomId) {
                const { error: clearError } = await supabase
                    .from('rooms')
                    .update({ occupant_id: null, status: 'available' })
                    .eq('id', fromRoomId);
                if (clearError) console.warn('Could not clear previous room:', clearError);
            }

            // Refresh lists
            await fetchRooms();
            await fetchOccupants();
            setShowMoveModal(false);
            setMovingOccupant(null);
            setMoveTargetRoomId(null);
            setMovingFromRoomId(null);
        } catch (err) {
            console.error('Error moving occupant:', err);
            alert('Error moving occupant');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignOccupant = async (roomId, occupantId) => {
        try {
            const { error } = await supabase
                .from('rooms')
                .update({
                    occupant_id: occupantId,
                    status: 'occupied'
                })
                .eq('id', roomId);

            if (error) throw error;

            setShowAssignModal(false);
            setSelectedRoom(null);
            fetchRooms();
            fetchOccupants();
        } catch (error) {
            console.error('Error assigning occupant:', error);
        }
    };

    const handleRemoveOccupant = async (roomId) => {
        try {
            const { error } = await supabase
                .from('rooms')
                .update({
                    occupant_id: null,
                    status: 'available'
                })
                .eq('id', roomId);

            if (error) throw error;
            fetchRooms();
            fetchOccupants();
        } catch (error) {
            console.error('Error removing occupant:', error);
        }
    };

    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.building.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || room.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const filteredOccupants = occupants.filter(occupant => {
        return occupant.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            occupant.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            occupant.email.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const availableOccupants = occupants.filter(occ => !occ.room || occ.room.length === 0);

    const getRoomStatusColor = (status) => {
        switch (status) {
            case 'available': return '#22c55e';
            case 'occupied': return '#3b82f6';
            case 'maintenance': return '#f59e0b';
            case 'reserved': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    return (
        <div className="rooms-occupants-page">
            {/* Header */}
            <header className="page-header">
                <div className="header-content">
                    <Link to="/admin" className="back-link">
                        <span className="back-icon">←</span>
                        Back to Dashboard
                    </Link>
                    <div className="header-info">
                        <h1 className="page-title">
                            <span className="title-icon">🏠</span>
                            Rooms & Occupants Management
                        </h1>
                        <p className="page-subtitle">Manage room assignments and occupant information</p>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button
                    className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rooms')}
                >
                    <span className="tab-icon">🏠</span>
                    Rooms ({rooms.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'occupants' ? 'active' : ''}`}
                    onClick={() => setActiveTab('occupants')}
                >
                    <span className="tab-icon">👥</span>
                    Occupants ({occupants.length})
                </button>
            </div>

            {/* Controls Bar */}
            <div className="controls-bar">
                <div className="search-filter">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder={activeTab === 'rooms' ? 'Search rooms...' : 'Search occupants...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {activeTab === 'rooms' && (
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Status</option>
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="reserved">Reserved</option>
                        </select>
                    )}
                </div>

                <div className="action-buttons">
                    <Link to="/register" className="btn-secondary">
                        <span className="btn-icon">👤</span>
                        Add Occupant
                    </Link>
                </div>
            </div>

            {/* Content Area */}
            <div className="content-area">
                {activeTab === 'rooms' ? (
                    <div className="rooms-grid">
                        {filteredRooms.map(room => (
                            <div key={room.id} className="room-card">
                                <div className="room-header">
                                    <div className="room-number">
                                        <span className="building">{room.building}</span>
                                        <span className="number">{room.room_number}</span>
                                    </div>
                                    <div
                                        className="room-status"
                                        style={{ backgroundColor: getRoomStatusColor(room.status) }}
                                    >
                                        {room.status}
                                    </div>
                                </div>

                                <div className="room-details">
                                    <div className="detail-item">
                                        <span className="label">Type:</span>
                                        <span className="value">{room.type}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Capacity:</span>
                                        <span className="value">{room.capacity} person(s)</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Rent:</span>
                                        <span className="value">₱{room.monthly_rent?.toLocaleString()}</span>
                                    </div>
                                    {room.floor && (
                                        <div className="detail-item">
                                            <span className="label">Floor:</span>
                                            <span className="value">{room.floor}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Show occupant(s) assigned to this room. If none, show Assign button */}
                                {room.occupant ? (
                                    // If occupant is an object or an array, normalize
                                    Array.isArray(room.occupant) ? (
                                        room.occupant.map((occ) => (
                                            <div key={occ.id} className="occupant-info">
                                                <div className="occupant-avatar">
                                                    {occ.first_name[0]}{occ.last_name[0]}
                                                </div>
                                                <div className="occupant-details">
                                                    <div className="occupant-name">
                                                        {occ.first_name} {occ.last_name}
                                                    </div>
                                                    <div className="occupant-email">{occ.email}</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        className="assign-btn"
                                                        onClick={() => {
                                                            setMovingOccupant(occ);
                                                            setMovingFromRoomId(room.id);
                                                            setShowMoveModal(true);
                                                        }}
                                                    >
                                                        Move
                                                    </button>
                                                    <button
                                                        className="remove-btn"
                                                        onClick={() => handleRemoveOccupant(room.id)}
                                                        title="Remove occupant"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="occupant-info">
                                            <div className="occupant-avatar">
                                                {room.occupant.first_name[0]}{room.occupant.last_name[0]}
                                            </div>
                                            <div className="occupant-details">
                                                <div className="occupant-name">
                                                    {room.occupant.first_name} {room.occupant.last_name}
                                                </div>
                                                <div className="occupant-email">{room.occupant.email}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="assign-btn"
                                                    onClick={() => {
                                                        setMovingOccupant(room.occupant);
                                                        setMovingFromRoomId(room.id);
                                                        setShowMoveModal(true);
                                                    }}
                                                >
                                                    Move
                                                </button>
                                                <button
                                                    className="remove-btn"
                                                    onClick={() => handleRemoveOccupant(room.id)}
                                                    title="Remove occupant"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div className="no-occupant">
                                        <span className="empty-icon">👤</span>
                                        <span className="empty-text">No occupant assigned</span>
                                        <button
                                            className="assign-btn"
                                            onClick={() => {
                                                setSelectedRoom(room);
                                                setShowAssignModal(true);
                                            }}
                                        >
                                            Assign Occupant
                                        </button>
                                    </div>
                                )}

                                {room.amenities && (
                                    <div className="amenities">
                                        <span className="amenities-label">Amenities:</span>
                                        <span className="amenities-list">{room.amenities}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="occupants-list">
                        {filteredOccupants.map(occupant => (
                            <div key={occupant.id} className="occupant-card">
                                <div className="occupant-avatar-large">
                                    {occupant.first_name[0]}{occupant.last_name[0]}
                                </div>
                                <div className="occupant-info-detailed">
                                    <div className="occupant-name-large">
                                        {occupant.first_name} {occupant.last_name}
                                    </div>
                                    <div className="occupant-email-large">{occupant.email}</div>
                                    {occupant.room && occupant.room.length > 0 ? (
                                        <div className="room-assignment">
                                            <span className="room-label">Room:</span>
                                            <span className="room-info">
                                                {occupant.room[0].building} {occupant.room[0].room_number}
                                            </span>
                                            <span className="rent-info">
                                                ₱{occupant.room[0].monthly_rent?.toLocaleString()}/month
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="no-room-assignment">
                                            <span className="no-room-icon">🏠</span>
                                            <span className="no-room-text">No room assigned</span>
                                        </div>
                                    )}
                                </div>
                                <div className="occupant-actions">
                                    <button className="action-btn edit">
                                        <span className="action-icon">✏️</span>
                                        Edit
                                    </button>
                                    <button className="action-btn view">
                                        <span className="action-icon">👁️</span>
                                        View
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Room removed — rooms are provided by the system */}

            {/* Assign Occupant Modal */}
            {showAssignModal && selectedRoom && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Assign Occupant to {selectedRoom.building} {selectedRoom.room_number}</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowAssignModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="available-occupants">
                                {availableOccupants.length > 0 ? (
                                    availableOccupants.map(occupant => (
                                        <div key={occupant.id} className="occupant-option">
                                            <div className="occupant-info">
                                                <div className="occupant-avatar">
                                                    {occupant.first_name[0]}{occupant.last_name[0]}
                                                </div>
                                                <div>
                                                    <div className="occupant-name">
                                                        {occupant.first_name} {occupant.last_name}
                                                    </div>
                                                    <div className="occupant-email">{occupant.email}</div>
                                                </div>
                                            </div>
                                            <button
                                                className="btn-primary"
                                                onClick={() => handleAssignOccupant(selectedRoom.id, occupant.id)}
                                            >
                                                Assign
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-available">
                                        <span className="empty-icon">👤</span>
                                        <p>No available occupants. All registered occupants are already assigned to rooms.</p>
                                        <Link to="/register" className="btn-primary">
                                            Register New Occupant
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Move Occupant Modal */}
            {showMoveModal && movingOccupant && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Move {movingOccupant.first_name} {movingOccupant.last_name}</h3>
                            <button
                                className="modal-close"
                                onClick={() => { setShowMoveModal(false); setMovingOccupant(null); setMoveTargetRoomId(null); setMovingFromRoomId(null); }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-content">
                            <p>Select the destination room to move this occupant to. Current room will be freed.</p>
                            <div className="available-occupants">
                                {rooms.filter(r => r.id !== movingFromRoomId).map(r => (
                                    <div key={r.id} className="occupant-option">
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div style={{ fontWeight: 700 }}>{r.building} {r.room_number}</div>
                                            <div style={{ color: '#6b7280' }}>Status: {r.status}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn-secondary" onClick={() => setMoveTargetRoomId(r.id)}>Select</button>
                                            <button className="btn-primary" onClick={() => handleMoveOccupant(movingOccupant.id, r.id, movingFromRoomId)}>Move Here</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RoomsOccupants;