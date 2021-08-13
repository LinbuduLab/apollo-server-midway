# Midway Serverless

芜湖！终于搞出第一版了！

还需要优化的：

- 目前 Landing Page 在部署完毕后访问会直接 403，猜测是因为容器的机制。
- 支持 Vercel Functions，需要首先尝试能不能直接配置 `provider: vercel` 就能工作，还是需要重新适配一套 Vercel 的请求/响应 handler。
- 由于 FaaS 函数不像 Node 应用那么灵活好做配置，考虑内置一些能力，如
  - 通过 extensions 字段提供一部分额外数据，如 Resolver Timing、 Response Tracing 等。
  - 内置一批 Directives / Scalars
  - 将 Midway Container 作为一个 Object Type 来提供更好的 Debug 能力？

芜湖！第二版！

## TODO:

- 内置一批 Apollo Server Plugin，并以单个选项开启，如 `complexity: {}`
- Apollo-Server / TypeGraphQL 配置处理（去掉目前不支持的选项）
- 内置一批 Directives、Scalars（为 BaaS 做准备）
- 自定义装饰器
- 支持响应生成的 schema
- 鉴权
- 支持响应 Voyager？
- Vercel 相关
- Lodash based directives
