const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const Router = require('koa-router');

const app = new Koa();
const router = new Router;


app.use(koaBody({
  urlencoded: true,
  multipart: true,
}));

app.use((ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*', };

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({ ...headers });       
    try {
      return next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }

    ctx.response.status = 204;
  }
});



let posts = [];
let nextId = 1;

router.get("/posts", (ctx) => {
  ctx.response.body = JSON.stringify(posts);
});

router.get("/posts/:id", (ctx) => {
  let match = ctx.request.url.match(/\/posts\/(\d+)$/);
  const postId = Number(match[1]);
  const index = posts.findIndex((o) => o.id === postId);
  ctx.response.body = JSON.stringify({ post: posts[index] });
});

router.post("/posts", (ctx) => {
  console.log(ctx.request.body)
  posts.push({ ...ctx.request.body, id: nextId++, created: Date.now() });
  ctx.response.status= 204;
});

router.put("/posts/:id", (ctx) => {
  console.log(ctx);
  console.log('пришел запрос put');
  let match = ctx.request.url.match(/\/posts\/(\d+)$/);
  const postId = Number(match[1]);
  posts = posts.map((o) => {
    if (o.id === postId) {
      return {
        ...o,
        ...ctx.request.body,
        id: o.id,
      };
    }
    return o;
  });
  ctx.request.status = 204;
  console.log(posts);

});

router.delete("/posts/:id", (ctx) => {
  console.log('пришел запрос на delete');
  let match = ctx.request.url.match(/\/posts\/(\d+)$/);
  const postId = Number(match[1]);
  const index = posts.findIndex((o) => o.id === postId);
  console.log(posts)
  if (index !== -1) {
    posts.splice(index, 1);
  }
  ctx.request.status = 204;
  console.log(posts)
});

app.use(router.routes())

const server = http.createServer(app.callback());
const port = 7071;
server.listen(port, (err) => {
    if (err) {
      console.log(err);
      return;
    }
  console.log('Server is listening to ' + port);
});