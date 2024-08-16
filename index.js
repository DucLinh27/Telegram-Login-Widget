const express = require('express');
const app = express();
const port = 3000;
const axios = require('axios');
let linkedAccounts = {};
const bodyParser = require('body-parser');

const TELEGRAM_BOT_TOKEN = '7060503269:AAF48xyQQLRJLlXVjH7MK2pL3FM_0rgXUFw';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/login', (req, res) => {
  res.send(`
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
      }
      .login-container {
        background-color: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      h2 {
        margin-bottom: 20px;
      }
      label {
        display: block;
        margin-bottom: 5px;
      }
      input {
        width: 100%;
        padding: 8px;
        margin-bottom: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      button {
        width: 100%;
        padding: 10px;
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      button:hover {
        background-color: #0056b3;
      }
    </style>
    <div class="login-container">
      <h2>Login</h2>
      <form method="POST" action="/login">
        <label>Email:</label>
        <input type="email" name="email" required>
        <label>Password:</label>
        <input type="password" name="password" required>
        <button type="submit">Login</button>
      </form>
    </div>
  `);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    res.send(`
      <h2>Welcome, ${email}</h2>
      <p>Now, link your Telegram account:</p>
      <script async src="https://telegram.org/js/telegram-widget.js?7"
              data-telegram-login="LinhaceBot"
              data-size="large"
              data-auth-url="https://f0ac-42-114-125-173.ngrok-free.app/auth/telegram?email=${email}"
              data-request-access="write"></script>
    `);
  } else {
    res.send('Invalid email or password');
  }
});

app.get('/auth/telegram', async (req, res) => {
  const { id, first_name, last_name, email } = req.query;

  if (!id || !email) {
    return res.status(400).json({ error: 'Missing id or email' });
  }

  const message = `Welcome ${first_name} ${last_name} (@${id}), you've successfully linked your Telegram account!`;

  // Lưu liên kết giữa email và telegram_id
  linkedAccounts[email] = id;

  try {
    // Gửi tin nhắn xác nhận qua Telegram
    const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: id,
      text: message
    });

    if (response.data.ok) {
      console.log('Message sent successfully');
    } else {
      console.error('Failed to send message', response.data);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }

  res.send(message);
});

// API kiểm tra liên kết
app.get('/check-link', (req, res) => {
  const { email } = req.query;

  if (linkedAccounts[email]) {
    return res.json({ linked: true, telegram_id: linkedAccounts[email] });
  }

  return res.json({ linked: false });
});

// API lấy email từ telegram_id
app.get('/get-email', (req, res) => {
  const { telegram_id } = req.query;

  const email = Object.keys(linkedAccounts).find(key => linkedAccounts[key] === telegram_id);
  
  if (email) {
    return res.json({ email });
  } else {
    return res.json({ email: null });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
