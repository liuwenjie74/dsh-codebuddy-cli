// schemastery 测试桩的单一来源。
//
// 背景：插件 Config 新增一个字段时，如果每个测试文件都各自复制一份桩，
// 就会出现「加一个 z.boolean() 让 9 个文件同时 TypeError」这类连锁失败。
// 现在所有测试文件都从这里取桩，新增字段只需改这一处。
//
// 两种用法：
//   变量形态：import { SCHEMA_STUB_SOURCE as schemaStub } from '../helpers/schemastery-stub.mjs'
//             registerHooks 里用 `data:text/javascript,${encodeURIComponent(schemaStub)}`
//   URL 形态：import { SCHEMA_STUB_INLINE_URL } from '../helpers/schemastery-stub.mjs'
//             registerHooks 里直接用该 URL

// 形态一：字段工厂（test/cn|intl 的 plugin / model-visibility、intl/structured-output、coexist 使用）
export const SCHEMA_STUB_SOURCE = `const field=()=>({description(){return this},default(value){this.fallback=value;return this},volatile(){return this}});export default {string:field,number:field,boolean:field,object:shape=>({shape})}`

// 形态二：内联字面量（account-plugin / image-plugin / request-size-plugin 使用）
export const SCHEMA_STUB_INLINE_SOURCE = `export default {object:x=>x,string:()=>({description(){return this},default(){return this},volatile(){return this}}),boolean:()=>({description(){return this},default(){return this},volatile(){return this}}),number:()=>({description(){return this},default(){return this},volatile(){return this}})}`

// 现成的 data: URL，供 registerHooks 直接返回。
export const SCHEMA_STUB_URL = 'data:text/javascript,' + encodeURIComponent(SCHEMA_STUB_SOURCE)
export const SCHEMA_STUB_INLINE_URL = 'data:text/javascript,' + encodeURIComponent(SCHEMA_STUB_INLINE_SOURCE)
