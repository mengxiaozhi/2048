// 引入必要模組
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3002;

// 中間件設置
app.use(bodyParser.json());
app.use(cors({
    origin: ['https://xiaozhi.moe'], // 添加前端域名
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// 建立 MySQL 連接池
const db = mysql.createPool({
    host: 'localhost',
    user: 'root', // 你的 MySQL 使用者名稱
    password: '2pxqdrrx', // 你的 MySQL 密碼
    database: '2048' // 資料庫名稱
});

// 測試 MySQL 連接
db.getConnection((err, connection) => {
    if (err) {
        console.error('資料庫連接失敗:', err);
        process.exit(1);
    }
    console.log('成功連接到 MySQL 資料庫');
    connection.release();
});

// 订阅接口
app.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: '電子郵件是必需的' });
    }

    // 電子郵件格式檢測
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: '電子郵件格式不正確' });
    }

    try {
        const connection = await db.promise();
        await connection.query('INSERT INTO subscribers (email) VALUES (?)', [email]);
        res.json({ message: '訂閱成功，感謝您的支持！' });
    } catch (error) {
        console.error('新增訂閱失敗:', error.message);

        // 判断是否是重复订阅
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ error: '電子郵件已訂閱過' });
        } else {
            res.status(500).json({ error: '伺服器錯誤，請稍後再試' });
        }
    }
});

// 用於記錄 IP 地址限制的對象
const rateLimit = {};

// 支持人數增加接口
app.post('/support', async (req, res) => {
    const ip = req.ip; // 獲取用戶的 IP 地址
    const timeNow = Date.now();

    // 檢查該 IP 是否已經支持過，並且是否在限制時間內
    if (rateLimit[ip] && timeNow - rateLimit[ip] < 60000) { // 60000 毫秒 = 1 分鐘
        return res.status(429).json({ error: '請勿頻繁支持，稍後再試！' });
    }

    // 更新該 IP 的支持時間
    rateLimit[ip] = timeNow;

    try {
        const connection = await db.promise();
        await connection.query('UPDATE support SET count = count + 1');
        const [rows] = await connection.query('SELECT count FROM support LIMIT 1');
        res.json({ count: rows[0].count, message: '感謝您的支持！' });
    } catch (error) {
        console.error('支持失敗:', error.message);
        res.status(500).json({ error: '伺服器錯誤，無法增加支持人數' });
    }
});

// 查询支持人数接口
app.get('/support/count', async (req, res) => {
    try {
        const connection = await db.promise();
        const [rows] = await connection.query('SELECT count FROM support LIMIT 1');
        if (rows.length > 0) {
            res.json({ count: rows[0].count });
        } else {
            res.status(404).json({ error: '支持人數記錄不存在' });
        }
    } catch (error) {
        console.error('获取支持人数失败:', error.message);
        res.status(500).json({ error: '伺服器錯誤，無法获取支持人数' });
    }
});

// 處理退訂請求
app.post('/unsubscribe', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: '請提供有效的電子郵件地址。' });
    }

    const query = 'DELETE FROM subscribers WHERE email = ?';

    db.query(query, [email], (err, result) => {
        if (err) {
            console.error('資料庫錯誤:', err);
            return res.status(500).json({ message: '伺服器發生錯誤，請稍後再試。' });
        }

        if (result.affectedRows > 0) {
            res.json({ message: `成功退訂：${email}` });
        } else {
            res.status(404).json({ message: `找不到電子郵件：${email}。` });
        }
    });
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`伺服器正在 http://localhost:${port} 運行`);
});