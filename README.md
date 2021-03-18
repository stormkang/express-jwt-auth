# JWT Auth Tutorial
基于Express的JWT验证教程.

## 依赖项
- [express](https://www.npmjs.com/package/express)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [nodemon](https://www.npmjs.com/package/nodemon)

## 验证思路:

1. 根据用户信息生成Token, 用于后面请求接口使用.

```js
// 基于用户信息使用jwt生成token, expiresIn 过期时间 
// 具体参见官方API: 
jwt.sign({user}, secretKey, { expiresIn: '30s' }, (err, token) => {
  res.json({ msg: 'success', token });
});
```

2. 利用中间件获取请求头中Authorization的token信息, 拿到token以后进行验证.

- 若验证通过, 调用next()放行进入下个中间件.
- 若验证失败, 禁止访问并给出对应失败提示.
```js
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
```

   

