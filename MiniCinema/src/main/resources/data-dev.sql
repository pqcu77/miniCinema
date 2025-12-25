-- Development sample data for H2 (application-dev profile)
-- Create some movies rows compatible with `movies` table used by JPA entity
INSERT INTO movies (movie_id, title, director, actors, genre, duration, release_date, country, language, rating, description, poster_url, trailer_url, box_office, status, create_time)
VALUES
(1, '测试电影1', '测试导演', '演员A,演员B', '动作', 120, DATE '2025-01-01', '中国', '普通话', 7.5, '测试电影1 的简介', 'https://via.placeholder.com/188x282?text=测试1', null, 0, 'screening', CURRENT_TIMESTAMP()),
(2, '霸王别姬', '陈凯歌', '张国荣,巩俐', '剧情,爱情', 174, DATE '1993-01-01', '中国', '汉语', 9.6, '程蝶衣和段小楼的京剧人生', 'https://via.placeholder.com/188x282?text=霸王别姬', null, 0, 'upcoming', CURRENT_TIMESTAMP()),
(3, '阿甘正传', '罗伯特·泽米吉斯', '汤姆·汉克斯', '剧情,爱情', 142, DATE '1994-07-06', '美国', '英语', 9.5, '智商75的阿甘一生的传奇经历', 'https://via.placeholder.com/188x282?text=阿甘', null, 0, 'upcoming', CURRENT_TIMESTAMP()),
(4, '泰坦尼克号', '詹姆斯·卡梅隆', '莱昂纳多·迪卡普里奥,凯特·温丝莱特', '爱情,灾难', 195, DATE '1997-12-19', '美国', '英语', 9.4, '杰克和露丝的跨越阶级的爱情', 'https://via.placeholder.com/188x282?text=泰坦尼克', null, 0, 'upcoming', CURRENT_TIMESTAMP()),
(5, '盗梦空间', '克里斯托弗·诺兰', '莱昂纳多·迪卡普里奥', '科幻,悬疑', 148, DATE '2010-09-01', '美国', '英语', 9.3, '进入他人梦境盗取机密的故事', 'https://via.placeholder.com/188x282?text=盗梦空间', null, 0, 'upcoming', CURRENT_TIMESTAMP());

-- Ensure H2 accepts inserts; create table if not exists for safety (DDL compatible with H2)
CREATE TABLE IF NOT EXISTS movies (
  movie_id INT PRIMARY KEY,
  title VARCHAR(255),
  director VARCHAR(255),
  actors TEXT,
  genre VARCHAR(255),
  duration INT,
  release_date DATE,
  country VARCHAR(100),
  language VARCHAR(50),
  rating DECIMAL(3,1),
  description TEXT,
  poster_url VARCHAR(500),
  trailer_url VARCHAR(500),
  box_office DECIMAL(12,2),
  status VARCHAR(50),
  create_time TIMESTAMP
);

-- Optionally insert comments table for comments related features
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  movie_id INT,
  content TEXT,
  rating DECIMAL(3,1),
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- user_history table
CREATE TABLE IF NOT EXISTS user_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  movie_id INT,
  action VARCHAR(50),
  score DECIMAL(3,1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  watch_duration INT
);

