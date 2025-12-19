 -- 清空现有电影数据
DELETE FROM movies;

-- 插入高质量电影数据（含 IMDb 海报 URL）
INSERT INTO movies (title, director, actors, genre, duration, release_date, country, language, rating, description, poster_url, trailer_url, box_office, status, create_time) VALUES

-- 经典电影系列
('肖申克的救赎', '弗兰克·达拉邦特', '蒂姆·罗宾斯,摩根·弗里曼', '剧情,犯罪', 142, '1994-10-14', '美国', '英语', 9.30, '一个被冤投入监狱的银行家，历经多年与狱友之间的友谊与救赎故事', 'https://www.themoviedb.org/t/p/w1280/5YBgcdKcxGJJOULqsFWlU03vm3V.jpg', '', 2800000000, '上映中', NOW()),
('霸王别姬', '陈凯歌', '张丰毅,葛优', '剧情,爱情', 171, '1993-01-01', '中国', '汉语', 9.50, '京剧名伶程蝶衣和段小楼的人生悲欢', 'https://media.themoviedb.org/t/p/w188_and_h282_face/vOEkLofQ8N1OdbGs5L87m7Plpw2.jpg', '', 1200000000, '上映中', NOW()),
('泰坦尼克号', '詹姆斯·卡梅隆', '莱昂纳多·迪卡普里奥,凯特·温斯莱特', '爱情,灾难', 194, '1997-12-19', '美国', '英语', 8.90, '邮轮沉没中贫富两人的生死爱恋', 'https://media.themoviedb.org/t/p/w188_and_h282_face/7ojgNNaZCDvp7IchH0uehUGJ0dH.jpg', '', 2187000000, '上映中', NOW()),
('阿甘正传', '罗伯特·泽米吉斯', '汤姆·汉克斯,莎莉·菲尔德', '剧情,爱情', 142, '1994-07-06', '美国', '英语', 9.50, '智商75的阿甘一生的传奇经历', 'https://media.themoviedb.org/t/p/w188_and_h282_face/yiWWUa1mB55dfd0QpGHsFsge67I.jpg', '', 839000000, '上映中', NOW()),
-- ('这个杀手不太冷', '吕克·贝松', '让·雷诺,娜塔莉·波特曼', '剧情,动作,犯罪', 110, '1994-09-14', '法国', '法语', 9.40, '职业杀手与12岁女孩的忘年之交', 'https://m.media-amazon.com/images/M/MV5BMTI5MzI2MzMtNjdkYi00NWQyLWFlMzAtYjZjNTgzOTBkMDY5XkEyXkFjcGdeQXVyNjc1NzM4NzA@._V1_SX300.jpg', '', 670000000, '上映中', NOW()),
-- ('盗梦空间', '克里斯托弗·诺兰', '莱昂纳多·迪卡普里奥,玛丽昂·歌迪亚', '科幻,悬疑', 148, '2010-09-01', '美国', '英语', 9.30, '进入他人梦境盗取机密的故事', 'https://m.media-amazon.com/images/M/MV5BMjAxMzc5ZDctNDg0Ny00MWFmLWE3NTEtNDY0Yk0xNmFmOGQ3XkEyXkFjcGdeQXVyNzU1NzE3NTg@._V1_SX300.jpg', '', 839000000, '上映中', NOW()),
-- ('星际穿越', '克里斯托弗·诺兰', '马修·麦康纳,安妮·海瑟薇', '科幻,冒险', 169, '2014-11-07', '美国', '英语', 8.60, '为拯救人类文明穿越虫洞寻找新家园', 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMTAtODZhMDZMNWFhOTg2XkEyXkFjcGdeQXVyNzU1NzE3NTg@._V1_SX300.jpg', '', 732000000, '上映中', NOW()),
-- ('忠犬八公的故事', '拉斯·霍尔斯道姆', '理查德·基尔,琼·艾伦', '剧情', 93, '2009-08-08', '美国', '英语', 8.40, '一只狗等待主人十年的感人故事', 'https://m.media-amazon.com/images/M/MV5BNDc1MDgyNzYtNzAxMS00NzBhLThhYmEtZDhhMzQ1ZDEwZDA2XkEyXkFjcGdeQXVyNjU0OTQ0ODA@._V1_SX300.jpg', '', 0, '上映中', NOW()),
--
-- -- 近期热门电影
-- ('疯狂动物城', '拜恩·霍华德,瑞奇·摩尔', '金·凯瑞,詹妮弗·古迪温', '喜剧,动画', 108, '2016-03-04', '美国', '英语', 8.50, '兔子警官和狐狸特工破案的冒险故事', 'https://m.media-amazon.com/images/M/MV5BOTMyMjEyNzEtN2U1OS00NTc3LTlmYTYtNDU3YzMyNDMzNzAxXkEyXkFjcGdeQXVyNzU1NzE3NTg@._V1_SX300.jpg', '', 1024000000, '上映中', NOW()),
-- ('寻梦环游记', '李·昂克里奇,阿德里安·莫利纳', '安东尼·贡萨雷斯,本杰明·布拉特', '喜剧,动画,家庭', 105, '2017-11-22', '美国', '英语/西班牙语', 8.30, '男孩与骷髅祖先共同冒险找到音乐梦想的故事', 'https://m.media-amazon.com/images/M/MV5BYjJlMzAxNDktMzk0Zi00MzA4LWE4ZjAtOWRjZGJiY2E4ZTYyXkEyXkFjcGdeQXVyNzU1NzE3NTg@._V1_SX300.jpg', '', 800000000, '上映中', NOW()),
-- ('黑客帝国', '沃卓斯基姐妹', '基努·里维斯,劳伦斯·菲什伯恩', '科幻,悬疑', 136, '1999-03-31', '美国', '英语', 8.70, '真实世界与虚拟世界之间的冒险对抗故事', 'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDl2YmQ0MjZjNDY1XkEyXkFjcGdeQXVyNjU0OTQ0ODA@._V1_SX300.jpg', '', 467000000, '上映中', NOW()),
-- ('钢铁侠', '乔·沙伊', '罗伯特·唐尼·Jr.,格温妮丝·帕特洛', '科幻,冒险', 126, '2008-05-02', '美国', '英语', 8.30, '天才工程师与军火商制造盔甲服装成为超级英雄', 'https://m.media-amazon.com/images/M/MV5BMTczNTI2NTk0OF5BMl5BanBnXkFtZTcwMTU0NTI3MQ@@._V1_SX300.jpg', '', 585000000, '上映中', NOW()),
-- ('活着', '张艺谋', '葛优,巩俐', '剧情', 125, '1994-07-01', '中国', '汉语', 9.20, '通过一个家庭在中国历史变迁中的遭遇展现人性的坚强', 'https://m.media-amazon.com/images/M/MV5BNDA3OWQ5NzItODc1Ny00YzA5LWE4OWQtMzQ5ZjI5ZTI0MWRmXkEyXkFjcGdeQXVyNzU1NzE3NTg@._V1_SX300.jpg', '', 0, '上映中', NOW()),
-- ('大话西游之大圣娶亲', '刘镇伟', '周星驰,朱茵', '喜剧,爱情', 85, '1995-02-04', '中国香港', '粤语', 8.20, '大圣为救爱人踏上西天之路的荒诞喜剧', 'https://m.media-amazon.com/images/M/MV5BMjAwOTA2ZGItNzFkNC00YzhlLThkZDgtZjczMTI5YjY0MDU1XkEyXkFjcGdeQXVyNzU1NzE3NTg@._V1_SX300.jpg', '', 0, '上映中', NOW()),
-- ('复仇者联盟', '乔斯·韦登', '罗伯特·唐尼·Jr.,克里斯·埃文斯', '科幻,冒险,奇幻', 143, '2012-05-04', '美国', '英语', 8.00, '各路超级英雄齐聚一堂拯救地球', 'https://m.media-amazon.com/images/M/MV5BNGE0ODEyNDgtODEwYS00ZjEzLWFmMDUtYzIzZjY5ZDlhMTFjXkEyXkFjcGdeQXVyNjc1NzM4NzA@._V1_SX300.jpg', '', 1520000000, '上映中', NOW()),
-- ('霸王别姬(2023版)', '陈凯歌', '于和伟,李晓红', '剧情,爱情', 172, '2023-03-01', '中国', '汉语', 8.40, '经典重映版本', 'https://m.media-amazon.com/images/M/MV5BZThjYzEzZS00YWYwLTg4MWItYTZmZC1lNTcyZGI2MDE1YzJXXkEyXkFjcGdeQXVyNzU1NzE3NTg@._V1_SX300.jpg', '', 0, '上映中', NOW()),
-- ('千与千寻', '宫崎骏', '', '动画,冒险,奇幻', 125, '2001-07-20', '日本', '日语', 8.90, '少女千寻在魔幻世界的冒险成长故事', 'https://m.media-amazon.com/images/M/MV5BY2FjYjlkODUtOTBmMy00ZDZkLWI1YmItOWZhYjg2YzZmYzdjXkEyXkFjcGdeQXVyNzU1NzE3NTg@._V1_SX300.jpg', '', 0, '上映中', NOW()),
-- ('龙猫', '宫崎骏', '', '动画,家庭,奇幻', 86, '1988-04-16', '日本', '日语', 8.30, '姐妹与神秘森林精灵龙猫的奇幻冒险', 'https://m.media-amazon.com/images/M/MV5BNjc5NDMwYzctZDIzMy00MWMxLTg5MDItN2ZhZmU4MzBjOGM0XkEyXkFjcGdeQXVyNzU1NzE3NTg@._V1_SX300.jpg', '', 0, '上映中', NOW());

-- 验证插入结果
SELECT COUNT(*) as '电影总数' FROM movies;

