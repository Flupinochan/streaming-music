## アーキテクチャ

基本的なアーキテクチャは [PopCal](https://flupinochan.github.io/popcal-document/docs/architecture/core/overview) Flutterアプリと同様な構成

## フォルダ構成

```yaml
src/
├── domain/
│   ├── entities/       # ロジック
│   ├── gateways/       # DB等以外の外部API呼び出し (Interface)
│   ├── repositories/   # entityをDB等に保存し永続化 (Interface)
│   ├── services/       # 複数のentityにまたがるロジック
│   ├── value_objects/  # primitive型の代わり
├── infrastructure/
│   ├── dto/            # infrastructure側で利用するデータ型
│   ├── mappers/        # dto, entityの変換処理
│   ├── repositories/   # 実装
│   └── gateways/       # 実装
├── presentation/
│   ├── dto/            # UI側で利用するデータ型
│   ├── mappers/        # dto, entityの変換処理
│   ├── stores/         # 状態管理
│   └── view/           # UI
└── use_cases/          # repository、gateway、serviceを利用したdomain層の複合処理、UIからのdto requestをmapperでentityに変換しつつ各domain処理を呼び出す。responseもmapperでentityからdtoに変換して返却
```

## ドメイン層で利用してよい型

- [プリミティブ型](https://typescriptbook.jp/reference/values-types-variables/primitive-types)
  - boolean
  - number
  - bigint
  - string
  - symbol
- [標準の組み込みオブジェクト](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects)
  - Array
  - ArrayBuffer
  - Date
- [WHATWG (URL)](https://ef-carbon.github.io/url/globals.html)
  - 組み込みオブジェクトではないが、browserおよびNode.jsどちらでも利用可能なためOK

## ドメイン層で利用してはいけないbrowser or Node.js依存の型

- File (Blob)、HTMLElement、fetch: browser依存のためNG
- fs、path: Node.js依存のためNG