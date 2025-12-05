# Rooms Database Schema

Add this SQL to your Supabase database to create the rooms table for the Rooms & Occupants functionality.

## Create Rooms Table

```sql
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL,
    building VARCHAR(100) NOT NULL,
    floor VARCHAR(20),
    type VARCHAR(50) NOT NULL DEFAULT 'single', -- 'single', 'double', 'suite', 'family'
    capacity INTEGER NOT NULL DEFAULT 1,
    monthly_rent DECIMAL(10,2),
    status VARCHAR(20) NOT NULL DEFAULT 'available', -- 'available', 'occupied', 'maintenance', 'reserved'
    amenities TEXT,
    occupant_id INTEGER REFERENCES occupants(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(building, room_number),
    CHECK (capacity > 0),
    CHECK (monthly_rent >= 0),
    CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
    CHECK (type IN ('single', 'double', 'suite', 'family'))
);
```

## Create Indexes

```sql
-- Index for searching rooms
CREATE INDEX idx_rooms_building ON rooms(building);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_type ON rooms(type);
CREATE INDEX idx_rooms_occupant ON rooms(occupant_id);
CREATE INDEX idx_rooms_number ON rooms(room_number);
```

## Set Up Row Level Security

```sql
-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Admin and SA can manage all rooms
CREATE POLICY "Admins can manage all rooms" ON rooms
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'sa')
    ));

-- Occupants can view their own room
CREATE POLICY "Occupants can view their room" ON rooms
    FOR SELECT USING (occupant_id IN (
        SELECT occupant_id FROM users WHERE id = auth.uid()
    ));

-- Treasurer can view all rooms (for financial reports)
CREATE POLICY "Treasurer can view all rooms" ON rooms
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM users WHERE role = 'treasurer'
    ));
```

## Add Trigger for Updated At

```sql
-- Trigger for updating updated_at timestamp
CREATE TRIGGER update_rooms_updated_at 
    BEFORE UPDATE ON rooms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Sample Data (Optional)

```sql
-- Insert sample rooms
INSERT INTO rooms (room_number, building, floor, type, capacity, monthly_rent, status, amenities) VALUES
('A-101', 'Building A', '1st Floor', 'single', 1, 5000.00, 'available', 'Wi-Fi, Air conditioning, Private bathroom'),
('A-102', 'Building A', '1st Floor', 'single', 1, 5000.00, 'available', 'Wi-Fi, Air conditioning, Private bathroom'),
('A-201', 'Building A', '2nd Floor', 'double', 2, 8000.00, 'available', 'Wi-Fi, Air conditioning, Private bathroom, Kitchen'),
('A-202', 'Building A', '2nd Floor', 'double', 2, 8000.00, 'available', 'Wi-Fi, Air conditioning, Private bathroom, Kitchen'),
('B-101', 'Building B', '1st Floor', 'suite', 2, 12000.00, 'available', 'Wi-Fi, Air conditioning, Private bathroom, Kitchen, Living room'),
('B-201', 'Building B', '2nd Floor', 'family', 4, 15000.00, 'available', 'Wi-Fi, Air conditioning, 2 bedrooms, Kitchen, Living room'),
('C-101', 'Building C', '1st Floor', 'single', 1, 4500.00, 'maintenance', 'Wi-Fi, Air conditioning, Shared bathroom'),
('C-102', 'Building C', '1st Floor', 'single', 1, 4500.00, 'available', 'Wi-Fi, Air conditioning, Shared bathroom');
```

## Usage Notes

### Room Status Types:
- **available**: Room is ready for new occupant
- **occupied**: Room currently has an occupant
- **maintenance**: Room is under repair/maintenance
- **reserved**: Room is reserved for specific occupant

### Room Types:
- **single**: Single occupancy room
- **double**: Double occupancy room  
- **suite**: Suite with multiple rooms
- **family**: Family room for multiple occupants

### Key Features:
- Unique constraint on building + room_number combination
- Foreign key relationship to occupants table
- Automatic timestamp management
- Row Level Security for different user roles
- Proper data validation with CHECK constraints