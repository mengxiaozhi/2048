// 引入必要模組
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

// 中間件設置
app.use(bodyParser.json());
app.use(cors({
    origin: process.env.CORS_ORIGINS.split(','), // 添加前端域名
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// 建立 MySQL 連接池
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER, // 你的 MySQL 使用者名稱
    password: process.env.DB_PASSWORD, // 你的 MySQL 密碼
    database: process.env.DB_NAME // 資料庫名稱
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

// 設置 Gmail 郵件傳送器
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // 請填入你的 Gmail 地址
        pass: process.env.EMAIL_PASS // 使用 Gmail 應用程式密碼
    }
});

// 订阅接口 - 發送確認郵件
app.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: '電子郵件是必需的' });
    }

    // 電子郵件格式檢測（更嚴謹的正則表達式）
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: '電子郵件格式不正確' });
    }

    // 生成確認令牌與到期時間（三天後）
    const token = crypto.randomBytes(20).toString('hex');
    const tokenExpiry = Date.now() + 3 * 24 * 60 * 60 * 1000; // 三天的毫秒數

    try {
        const connection = await db.promise();
        // 插入待確認訂閱記錄（請確認資料表已包含 confirmation_token、token_expiry、is_confirmed 欄位）
        await connection.query(
            'INSERT INTO subscribers (email, confirmation_token, token_expiry, is_confirmed) VALUES (?, ?, ?, ?)',
            [email, token, tokenExpiry, 0]
        );
        // 構造確認連結
        const confirmUrl = `https://xiaozhi.moe/2048/confirm?token=${token}`;
        const mailOptions = {
            from: '"志在未來2048" <no-reply@xiaozhi.moe>',
            to: email,
            subject: '訂閱確認 - 請在三天內完成確認',
            text: `請點擊以下連結確認您的訂閱，該連結在三天內有效： ${confirmUrl}`,
            html: `
            <p>請點擊以下連結確認您的訂閱，該連結在三天內有效：</p>
            <a href="${confirmUrl}">${confirmUrl}</a>
            <p> 
                --<br>
                此郵件為系統自動發出，請勿回覆。<br>
                This email is automatically sent by the system, please do not reply.<br>
            </p>
            `
        };

        // 發送確認郵件
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('發送確認郵件失敗:', error);
                return res.status(500).json({ error: '發送確認郵件失敗' });
            }
            res.json({ message: '訂閱成功，請檢查您的電子郵件進行確認' });
        });
    } catch (error) {
        console.error('新增訂閱失敗:', error.message);
        // 處理重複訂閱的情況（假設 email 欄位有唯一索引）
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ error: '電子郵件已訂閱過' });
        } else {
            res.status(500).json({ error: '伺服器錯誤，請稍後再試' });
        }
    }
});

// 確認訂閱接口
app.get('/confirm', async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ error: '無效的請求，缺少 token' });
    }

    try {
        const connection = await db.promise();
        const [rows] = await connection.query(
            'SELECT * FROM subscribers WHERE confirmation_token = ?',
            [token]
        );
        if (rows.length === 0) {
            return res.status(400).json({ error: '無效或已過期的確認連結' });
        }
        const subscriber = rows[0];
        // 檢查令牌是否過期
        if (Date.now() > subscriber.token_expiry) {
            return res.status(400).json({ error: '確認連結已過期' });
        }
        // 更新訂閱狀態為已確認，並清除令牌與到期時間
        await connection.query(
            'UPDATE subscribers SET is_confirmed = 1, confirmation_token = NULL, token_expiry = NULL WHERE id = ?',
            [subscriber.id]
        );

        // res.send('訂閱確認成功，感謝您的訂閱！');
        res.json({ message: '訂閱確認成功，感謝您的訂閱！' });
    } catch (error) {
        console.error('確認訂閱失敗:', error.message);
        res.status(500).json({ error: '伺服器錯誤，無法確認訂閱' });
    }
});

// 用於記錄 IP 地址限制的對象
const rateLimit = {};

// 支持人數增加接口
app.post('/support', async (req, res) => {
    const ip = req.ip; // 獲取用戶的 IP 地址
    const timeNow = Date.now();

    // 檢查該 IP 是否已經支持過，並且是否在限制時間內（1 分鐘）
    if (rateLimit[ip] && timeNow - rateLimit[ip] < 60000) {
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

// 獲取訂閱者電子郵件列表（需要授權）
app.get('/subscribers', (req, res) => {
    const apiKey = req.headers['authorization']; // 從請求頭部獲取金鑰
    const VALID_API_KEY = process.env.API_Token; // 定義合法的 API 金鑰

    if (apiKey !== VALID_API_KEY) {
        return res.status(403).json({ error: '未授權的訪問' });
    }

    // 返回訂閱者列表
    db.query('SELECT email FROM subscribers WHERE is_confirmed = 1', (err, result) => {
        if (err) {
            console.error('資料庫錯誤:', err);
            return res.status(500).json({ error: '伺服器錯誤' });
        }
        res.json({ subscribers: result.map(row => row.email) });
    });
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`伺服器正在 http://localhost:${port} 運行`);
});