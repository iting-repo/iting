CREATE TABLE banners (
  id SERIAL PRIMARY KEY,
  position VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  image_desktop VARCHAR(500),
  image_mobile VARCHAR(500),
  link VARCHAR(500),
  start_at TIMESTAMP,
  end_at TIMESTAMP,
  priority INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  updated_by VARCHAR(50)
);
