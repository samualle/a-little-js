模拟 MVC 模式

```javascript
/* 模拟 Model，View，Controller */
var M = {}, V = {}, C = {};

/* Model 负责存储数据*/
M.data = "hello world";

/* View 负责将数据输出到屏幕上 */
V.render = (M) => { alert(M.data); };

/* Controller 作为 Model 和 View 的桥梁 */
C.handleOnload = () => { V.render(M); };

/* 在页面加载的时候调用 Controller */
window.onload = C.handleOnload;
```
