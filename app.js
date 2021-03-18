const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

const secretKey = 'secretKey'; // 任意字符串

app.get('/', (req, res) => {
  res.send(`<h1>JWT Auth</h1><p>A simple JWT auth demo.</p>`);
});

/**
 * 登录接口, 忽略用户名&密码验证.
 * 用户登录成功以后, 服务器根据登录信息生成token返给客户端.
 */
app.post('/login', (req, res) => {
  // 模拟用户登录信息
  const user = {
    id: "2020001",
    username: "master",
    email: "example@gmail.com",
  }

  // 基于用户信息使用jwt生成token
  // expiresIn 过期时间, 具体参见官方API.
  jwt.sign({user}, secretKey, { expiresIn: '60s' }, (err, token) => {
    console.log('token', token);
    res.json({
      msg: '登录成功',
      token, // 将token返给客户端
    });
  });

});

/**
 * 通过verifyToken中间件进行验证
 */
app.post('/api/posts', verifyToken, (req, res) => {
  res.json({ msg: '验证成功' });
});

/**
 * 验证JWT中间件
 */
function verifyToken(req, res, next) {
  // 解析请求头Authorization, 获取token信息. 建议使用Postman进行调试.
  // 请求接口前记得在Headers中添加Authorization头(首字母A大写), 对应的值就是之前登录生成的token
  // 这里authorization的首字母A一定要小写!!!  
  // 具体参考: http://nodejs.cn/api/http2.html#http2_request_headers
  const token = req.headers['authorization']; 
  if (token) {
    // 有token, 进行验证
    jwt.verify(token, secretKey, (err, data) => {
      if (err) {
        // 验证失败
        const { name, message } = err;
        // 自定义code码. 过期: 8001, 无效: 8002, 默认8000.
        const code = name === 'TokenExpiredError' ? 
          8001 : (name === 'JsonWebTokenError' ? 8002 : 8000);
        res.json({ code, msg: message });
      } else {
        // 验证成功
        console.log('data', JSON.stringify(data, null, 2));
        // 放行, 到下一个中间件
        next(); 
      }
    });
  } else {
    // 如果没有token, 禁止访问.
    res.json({ msg: '没有token, 禁止访问' });
  }
}

app.listen(3000, () => {
  console.log('App running at http://127.0.0.1:3000');
});